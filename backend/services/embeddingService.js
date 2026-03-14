import { GoogleGenerativeAI } from '@google/generative-ai';

class CustomGeminiEmbeddings {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.modelName = null;
    this.model = null;
  }

  async _initModel() {
    if (this.model) return;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.models) {
        const embedModels = data.models.filter(m => m.supportedGenerationMethods?.includes('embedContent'));
        if (embedModels.length > 0) {
           this.modelName = embedModels[0].name.replace('models/', '');
        }
      }
    } catch(e) {}
    
    // Fallback if fetch fails
    if (!this.modelName) this.modelName = 'text-embedding-004';
    console.log(`Using Gemini Embedding Model: ${this.modelName}`);
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async embedQuery(text) {
    await this._initModel();
    const result = await this.model.embedContent(text);
    return result.embedding.values;
  }

  async embedDocuments(documents) {
    await this._initModel();
    const embeddings = [];
    for (const doc of documents) {
      const result = await this.model.embedContent(doc);
      embeddings.push(result.embedding.values);
    }
    return embeddings;
  }
}

let embeddingsInstance = null;
export const getEmbeddings = () => {
  if (!embeddingsInstance) {
    embeddingsInstance = new CustomGeminiEmbeddings();
  }
  return embeddingsInstance;
};
