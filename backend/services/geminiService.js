import { GoogleGenerativeAI } from '@google/generative-ai';
import { getIntentPrompt, parseGeminiResponse } from '../utils/intentParser.js';
import { Logger } from '../utils/logger.js';

export const detectIntent = async (userMessage) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      Logger.warn("GEMINI_API_KEY is not set in environment variables.");
      return { intent: "unknown", parameters: {} };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = getIntentPrompt(userMessage);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseGeminiResponse(text);
  } catch (error) {
    Logger.error("Gemini Intent Detection Error:", error);
    return { intent: "unknown", parameters: {} };
  }
};
