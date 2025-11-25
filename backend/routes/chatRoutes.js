const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const llmService = require('../services/llmService');

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { query, emailId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let context = "";
    let systemPrompt = "You are a helpful email productivity assistant.";

    if (emailId) {
      const email = await Email.findById(emailId);
      if (email) {
        context = `
        Current Email Context:
        Sender: ${email.sender}
        Subject: ${email.subject}
        Body: ${email.body}
        Category: ${email.category}
        Action Items: ${JSON.stringify(email.actionItems)}
        `;
        systemPrompt += " Answer the user's question based on the email context provided.";
      }
    } else {
        // General inbox context (could be optimized to not fetch everything)
        const recentEmails = await Email.find().sort({ timestamp: -1 }).limit(5);
        const emailSummaries = recentEmails.map(e => `- From: ${e.sender}, Subject: ${e.subject}, Category: ${e.category}`).join('\n');
        context = `
        Recent Emails in Inbox:
        ${emailSummaries}
        `;
        systemPrompt += " You have access to the user's recent emails. Answer questions about the inbox.";
    }

    const response = await llmService.generateResponse(systemPrompt, `Context:\n${context}\n\nUser Query: ${query}`);

    res.json({ response });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;
