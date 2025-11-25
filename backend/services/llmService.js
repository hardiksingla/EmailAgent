const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const llmService = {
  generateResponse: async (systemPrompt, userContent) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `${systemPrompt}\n\n${userContent}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
      } catch (error) {
        attempt++;
        const isOverloaded = error.message?.includes('overloaded') || error.status === 503;
        
        if (isOverloaded && attempt < maxRetries) {
          console.warn(`LLM Service Overloaded (Attempt ${attempt}/${maxRetries}). Retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error("LLM Service Error:", error);
          throw new Error("Failed to generate response from LLM");
        }
      }
    }
  }
};

module.exports = llmService;
