const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingService = {
  embedText: async (text) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Using text-embedding-004 model
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        console.log(result);
        return result.embedding.values;
      } catch (error) {
        attempt++;
        const isOverloaded = error.message?.includes('overloaded') || error.status === 503;
        
        if (isOverloaded && attempt < maxRetries) {
          console.warn(`Embedding Service Overloaded (Attempt ${attempt}/${maxRetries}). Retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error("Embedding Service Error:", error);
          throw new Error("Failed to generate embedding");
        }
      }
    }
  }
};

module.exports = embeddingService;
