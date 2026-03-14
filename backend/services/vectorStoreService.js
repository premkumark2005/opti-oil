import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddingService.js';
import { Logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_DIR = path.join(__dirname, '..', 'vector_store');

let vectorStoreInstance = null;

export const buildIndex = async (chunks) => {
  Logger.info(`Building FAISS index with ${chunks.length} chunks...`);
  
  const docs = chunks.map(c => new Document({
    pageContent: c.text,
    metadata: c.metadata
  }));

  const embeddings = getEmbeddings();
  vectorStoreInstance = await FaissStore.fromDocuments(docs, embeddings);
  
  if (!fs.existsSync(INDEX_DIR)) {
    fs.mkdirSync(INDEX_DIR, { recursive: true });
  }
  await vectorStoreInstance.save(INDEX_DIR);
  
  Logger.info(`FAISS index saved to ${INDEX_DIR}`);
  return vectorStoreInstance;
};

export const loadIndex = async () => {
  if (vectorStoreInstance) return vectorStoreInstance;
  
  if (!fs.existsSync(path.join(INDEX_DIR, 'faiss.index'))) {
    Logger.warn('FAISS index not found. Run `node scripts/ingestData.js` to build it.');
    return null;
  }

  try {
    const embeddings = getEmbeddings();
    vectorStoreInstance = await FaissStore.load(INDEX_DIR, embeddings);
    Logger.info('FAISS index loaded successfully.');
    return vectorStoreInstance;
  } catch (err) {
    Logger.error('Failed to load FAISS index:', err.message);
    return null;
  }
};

export const similaritySearch = async (query, k = 5, userRole, userId = null) => {
  const store = await loadIndex();
  if (!store) return [];

  // Retrieve extra candidates to allow for role filtering
  const candidates = await store.similaritySearch(query, k * 3);

  return candidates
    .filter(doc => {
      const access = doc.metadata?.roleAccess || [];
      if (!access.includes(userRole)) return false;

      // Scope wholesaler's own orders
      if (userRole === 'wholesaler' && doc.metadata?.collection === 'orders') {
        return userId && doc.metadata?.wholesalerId === userId;
      }

      // Scope supplier's own materials / orders
      if (userRole === 'supplier') {
        const col = doc.metadata?.collection;
        if (col === 'rawmaterials' || col === 'rawmaterialorders') {
          return userId && doc.metadata?.supplierId === userId;
        }
      }

      return true;
    })
    .slice(0, k);
};
