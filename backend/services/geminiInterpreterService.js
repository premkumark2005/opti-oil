import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/logger.js';

export const interpretUserQuery = async (userMessage) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      Logger.warn("GEMINI_API_KEY is not set.");
      throw new Error("API Key missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a database query generator for a supply chain system backend.

Your task is to convert the user's question into a JSON query.
Available collections:
- orders
- products
- inventory
- rawmaterials
- suppliers
- production
- rawmaterialorders
- users

Allowed operations:
- find
- count
- aggregate
- sum

To check if something is low in stock in inventory, use { "$expr": { "$lte": ["$availableQuantity", "$reorderLevel"] } }.
To check dates today, use "today" as the value, e.g., { "createdAt": "today" }.
Use regex for string matching like { "name": { "$regex": "product name", "$options": "i" } }.
For sums or total revenue, use the "aggregate" operation with a full aggregation pipeline array in the filter.
To query users by specific roles like wholesaler or supplier, filter the "users" collection with { "role": "wholesaler" }.

Return only JSON.

Example 1:
User question: What is the total revenue generated?
Output:
{
  "collection": "orders",
  "operation": "aggregate",
  "filter": [
    { "$group": { "_id": null, "totalRevenue": { "$sum": "$totalAmount" } } }
  ]
}

Example 2:
User question: How many orders were placed today?
Output:
{
  "collection": "orders",
  "operation": "count",
  "filter": {
    "createdAt": "today"
  }
}

Example 3:
User question: Which products are low in stock?
Output:
{
  "collection": "inventory",
  "operation": "find",
  "filter": {
    "$expr": { "$lte": ["$availableQuantity", "$reorderLevel"] }
  }
}

User question:
${userMessage}
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    Logger.error("Gemini Interpreter Error:", error);
    return null;
  }
};
