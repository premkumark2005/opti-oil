/**
 * Data Ingestion Script — builds the FAISS vector index from MongoDB data.
 * Run this once after setup, and again whenever the database data changes significantly.
 *
 * Usage:
 *   node scripts/ingestData.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { ingestAllData } from '../services/dataIngestionService.js';
import { buildIndex } from '../services/vectorStoreService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edible-oil-inventory';

async function main() {
  console.log('📦 Opti-Oil — RAG Data Ingestion');
  console.log('=================================');

  // 1. Connect to MongoDB
  console.log(`\n🔌 Connecting to MongoDB: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // 2. Load data from all collections
  console.log('📄 Ingesting data from all collections...');
  const chunks = await ingestAllData();
  console.log(`✅ Loaded ${chunks.length} document chunks\n`);

  if (chunks.length === 0) {
    console.warn('⚠️  No chunks generated — your database may be empty.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // 3. Build and save the FAISS vector index
  console.log('🔢 Generating embeddings and building FAISS index...');
  console.log('   (This may take a minute depending on data volume)\n');
  await buildIndex(chunks);
  console.log('✅ FAISS index built and saved to ./vector_store/\n');

  await mongoose.disconnect();
  console.log('🎉 Ingestion complete! The chatbot is ready to use.');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Ingestion failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
