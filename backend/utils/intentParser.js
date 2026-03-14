export const getIntentPrompt = (userMessage) => {
  return `You are a query interpreter for a supply chain system backend database.
Return the intent and parameters in valid JSON format ONLY. Do NOT return any markdown formatting outside of JSON.
Your JSON must have the following keys:
- "intent": string
- "parameters": object containing any extracted parameters (like "productName", "materialName", etc.)

Possible intents:
- "sales_today"
- "low_stock_products"
- "low_stock_materials"
- "supplier_orders"
- "product_inventory" (extract "productName" if given)
- "product_price" (extract "productName" if given)
- "user_orders"
- "total_orders"
- "supplier_materials"
- "top_ordered_product"
- "unknown"

User message:
${userMessage}
`;
};

export const parseGeminiResponse = (text) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return {
      intent: parsed.intent || 'unknown',
      parameters: parsed.parameters || {}
    };
  } catch (error) {
    return { intent: "unknown", parameters: {} };
  }
};
