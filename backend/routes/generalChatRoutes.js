const express = require('express');
const router = express.Router();
const embeddingService = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');
const llmService = require('../services/llmService');
const Email = require('../models/Email');

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

    // Extract unique email IDs
    const emailIds = [...new Set(searchResults.map(r => r.payload.emailId))];

    // Fetch full emails
    const emails = await Email.find({ _id: { $in: emailIds } });
    const emailMap = new Map(emails.map(e => [e._id.toString(), e]));

    searchResults.forEach(result => {
      const payload = result.payload;
      const fullEmail = emailMap.get(payload.emailId);

      if (fullEmail) {
        // Use full email body if available, otherwise fallback to payload text (unlikely)
        const content = fullEmail.body || payload.text;
        
        // Avoid adding the same email multiple times to the context if multiple chunks matched
        if (!context.includes(`Subject: ${fullEmail.subject}`)) {
           context += `Subject: ${fullEmail.subject}\nSender: ${fullEmail.sender}\nDate: ${fullEmail.timestamp}\nContent: ${content}\n\n---\n\n`;
        }

        // Deduplicate sources for frontend display
        if (!sources.find(s => s.emailId === payload.emailId)) {
          sources.push({
            emailId: payload.emailId,
            subject: payload.subject,
            sender: payload.sender
          });
        }
      }
    });

    // 4. Generate Answer with LLM
    const systemPrompt = `You are a helpful email assistant. Answer the user's question based ONLY on the provided email context. 
If the answer is not in the context, say "I couldn't find that information in your emails."
Cite the email subject or sender if relevant, do not add any * or any other symbol for markdown formatting.

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
