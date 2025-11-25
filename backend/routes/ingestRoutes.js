const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const PromptConfig = require('../models/PromptConfig');
const llmService = require('../services/llmService');

const { v4: uuidv4 } = require('uuid');
const embeddingService = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');

// Helper function to process a single email
async function processSingleEmail(email, catPromptConfig, actionPromptConfig) {
  // Categorization
  const catPrompt = catPromptConfig.templateContent
    .replace('{{subject}}', email.subject)
    .replace('{{body}}', email.body);
  
  const category = await llmService.generateResponse(catPrompt, "");
  email.category = category.trim();

  // Check for Spam
  if (email.category.toLowerCase().includes('spam')) {
    email.actionItems = [];
    console.log(`Email ${email._id} classified as SPAM. Skipping action extraction.`);
  } else {
    // Action Extraction
    const actionPrompt = actionPromptConfig.templateContent
      .replace('{{subject}}', email.subject)
      .replace('{{body}}', email.body);

    const actionResponse = await llmService.generateResponse(actionPrompt, "");
    
    let actionItems = [];
    try {
      // Clean up markdown code blocks if present
      const jsonString = actionResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      actionItems = JSON.parse(jsonString);
    } catch (e) {
      console.warn(`Failed to parse action items for email ${email._id}:`, e);
      // Fallback or empty array
    }
    email.actionItems = actionItems;

    // --- RAG: Chunk & Embed ---
    try {
      // Strip HTML tags
      const plainText = email.body.replace(/<[^>]*>?/gm, '');

      // Chunking strategy: 2000 chars or end of mail
      const chunks = [];
      const chunkSize = 2000;
      
      for (let i = 0; i < plainText.length; i += chunkSize) {
        chunks.push(plainText.slice(i, i + chunkSize));
      }

      const points = [];

      for (const chunk of chunks) {
        // Skip empty chunks
        if (!chunk.trim()) continue;

        const vector = await embeddingService.embedText(chunk);
        points.push({
          id: uuidv4(),
          vector: vector,
          payload: {
            emailId: email._id.toString(),
            subject: email.subject,
            sender: email.sender,
            text: chunk,
            timestamp: email.timestamp
          }
        });
      }

      if (points.length > 0) {
        await vectorStore.upsertVectors(points);
        console.log(`Embedded ${points.length} chunks for email ${email._id}`);
      }
    } catch (embedError) {
      console.error(`Failed to embed email ${email._id}:`, embedError);
      // Don't fail the whole process, just log
    }
  }

  email.isProcessed = true;
  await email.save();
  return email;
}

// GET /api/emails
router.get('/', async (req, res) => {
  try {
    const emails = await Email.find().sort({ timestamp: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// GET /api/emails/:id
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// PATCH /api/emails/:id (Update Email)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const email = await Email.findByIdAndUpdate(id, updates, { new: true });
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    res.json(email);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// POST /api/emails/receive (New Endpoint)
router.post('/receive', async (req, res) => {
  try {
    const { sender, subject, body } = req.body;
    
    if (!sender || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: sender, subject, body' });
    }

    // Create new email
    const email = new Email({
      sender,
      subject,
      body,
      timestamp: new Date(),
      status: 'Unread',
      isProcessed: false
    });
    await email.save();

    // Fetch Prompts
    const catPromptConfig = await PromptConfig.findOne({ promptType: 'categorization' });
    const actionPromptConfig = await PromptConfig.findOne({ promptType: 'action_extraction' });

    if (catPromptConfig && actionPromptConfig) {
      await processSingleEmail(email, catPromptConfig, actionPromptConfig);
    }

    res.json(email);

  } catch (error) {
    console.error('Receive Error:', error);
    res.status(500).json({ error: 'Failed to receive and process email', details: error.message });
  }
});

// POST /api/ingest (Batch Processing)
router.post('/', async (req, res) => {
  try {
    // Fetch unprocessed emails
    const unprocessedEmails = await Email.find({ isProcessed: false });

    if (unprocessedEmails.length === 0) {
      return res.json({ message: 'No new emails to process', count: 0 });
    }

    // Helper for delay
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Fetch Prompts
    const catPromptConfig = await PromptConfig.findOne({ promptType: 'categorization' });
    const actionPromptConfig = await PromptConfig.findOne({ promptType: 'action_extraction' });

    if (!catPromptConfig || !actionPromptConfig) {
      return res.status(500).json({ error: 'Missing prompt configurations' });
    }

    let processedCount = 0;

    // Process each email
    for (const email of unprocessedEmails) {
      await processSingleEmail(email, catPromptConfig, actionPromptConfig);
      processedCount++;
      
      // Wait 5 seconds between emails to avoid rate limits
      if (processedCount < unprocessedEmails.length) {
        await delay(5000);
      }
    }

    res.json({ message: 'Ingestion complete', count: processedCount });

  } catch (error) {
    console.error('Ingestion Error:', error);
    res.status(500).json({ error: 'Ingestion failed', details: error.message });
  }
});

// POST /api/emails/generate-replies
router.post('/generate-replies', async (req, res) => {
  try {
    const { emailId } = req.body;
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: 'Email not found' });

    const promptConfig = await PromptConfig.findOne({ promptType: 'reply_generation' });
    if (!promptConfig) return res.status(500).json({ error: 'Reply prompt not found' });

    const prompt = promptConfig.templateContent
      .replace('{{subject}}', email.subject)
      .replace('{{body}}', email.body);

    const response = await llmService.generateResponse(prompt, "");
    
    // Clean and parse JSON
    const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const replies = JSON.parse(jsonString);

    res.json(replies);
  } catch (error) {
    console.error('Reply Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate replies', details: error.message });
  }
});

// POST /api/emails/send
const { sendEmail } = require('../services/emailSender');

router.post('/send', async (req, res) => {
  try {
    const { to, subject, body, emailId } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendEmail({ to, subject, text: body });

    // Update email status if linked
    if (emailId) {
      await Email.findByIdAndUpdate(emailId, { status: 'Replied' });
    }

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send Error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

module.exports = router;
