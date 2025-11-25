const express = require('express');
const router = express.Router();
const embeddingService = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');
const llmService = require('../services/llmService');

// POST /api/general-chat
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // 1. Embed the user's query
    const queryVector = await embeddingService.embedText(query);

    // 2. Search for relevant email chunks
    const searchResults = await vectorStore.search(queryVector, 5); // Top 5 chunks

    // 3. Construct Context
    let context = "";
    const sources = [];

    searchResults.forEach(result => {
      const payload = result.payload;
      context += `Subject: ${payload.subject}\nSender: ${payload.sender}\nDate: ${payload.timestamp}\nContent: ${payload.text}\n\n---\n\n`;
      
      // Deduplicate sources for frontend display
      if (!sources.find(s => s.emailId === payload.emailId)) {
        sources.push({
          emailId: payload.emailId,
          subject: payload.subject,
          sender: payload.sender
        });
      }
    });

    // 4. Generate Answer with LLM
    const systemPrompt = `You are a helpful email assistant. Answer the user's question based ONLY on the provided email context. 
If the answer is not in the context, say "I couldn't find that information in your emails."
Cite the email subject or sender if relevant.

Context:
${context}`;

    const answer = await llmService.generateResponse(systemPrompt, query);

    res.json({
      answer: answer,
      sources: sources
    });

  } catch (error) {
    console.error('General Chat Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

module.exports = router;
