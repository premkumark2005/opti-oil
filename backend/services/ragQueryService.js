import { GoogleGenerativeAI } from '@google/generative-ai';
import { similaritySearch } from './vectorStoreService.js';
import { Logger } from '../utils/logger.js';

const FALLBACK = "I could not find relevant data in the system. Please try rephrasing your question or ask about orders, products, inventory, raw materials, or suppliers.";

export const ragQuery = async (userMessage, user) => {
  try {
    const role = user.role;
    const userId = String(user.id || user._id || '');

    // 1. Retrieve relevant chunks from FAISS
    const chunks = await similaritySearch(userMessage, 6, role, userId);

    if (!chunks || chunks.length === 0) {
      return FALLBACK;
    }

    // 2. Build context string
    const context = chunks
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join('\n\n');

    // 3. Build prompt for Gemini
    const prompt = `You are an AI data assistant for an edible oil supply chain management system called Opti-Oil.

You MUST answer using ONLY the provided context. Do NOT hallucinate or invent data.
If the context does not contain the answer, say: "I could not find that information in the system."

Provide a concise, factual, well-formatted answer. Use bullet points or numbered lists for multiple items.

Context from the database:
${context}

User question: ${userMessage}

Answer:`;

    // 4. Call Gemini for the final answer
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text || FALLBACK;
  } catch (error) {
    Logger.error('RAG Query Error:', error.message);
    return FALLBACK;
  }
};
