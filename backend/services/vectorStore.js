const { QdrantClient } = require('@qdrant/js-client-rest');

// Connect to Qdrant (assuming running on localhost:6333 via Docker)
const client = new QdrantClient({
    url: 'https://2ae3efdc-c36d-4417-93bb-81b0a9ce35e6.eu-west-1-0.aws.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.hx2vy0FK6OvdKGYVw_45MefdKwTryGr5-qyH56wCOtM',
});
const COLLECTION_NAME = 'emails';

const vectorStore = {
  initCollection: async () => {
    try {
      const result = await client.getCollections();
      const exists = result.collections.some(c => c.name === COLLECTION_NAME);
      
      if (!exists) {
        // Gemini text-embedding-004 produces 768-dimensional vectors
        await client.createCollection(COLLECTION_NAME, {
          vectors: { size: 768, distance: 'Cosine' }
        });
        console.log(`Qdrant collection '${COLLECTION_NAME}' created.`);
      } else {
        console.log(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
      }
    } catch (error) {
      console.error("Vector Store Init Error:", error);
      // Don't crash app if Qdrant isn't ready, just log
    }
  },

  upsertVectors: async (points) => {
    // points: Array of { id, vector, payload }
    try {
      await client.upsert(COLLECTION_NAME, {
        points: points
      });
    } catch (error) {
      console.error("Vector Upsert Error:", error);
      throw error;
    }
  },

  search: async (vector, limit = 5) => {
    try {
      const result = await client.search(COLLECTION_NAME, {
        vector: vector,
        limit: limit,
        with_payload: true
      });
      console.log(result);
      // const highScore = result.filter(item=>item.score>0.5)
      // console.log(highScore)
      return result;
    } catch (error) {
      console.error("Vector Search Error:", error);
      throw error;
    }
  }
};

module.exports = vectorStore;
