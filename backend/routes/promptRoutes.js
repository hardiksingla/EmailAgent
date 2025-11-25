const express = require('express');
const router = express.Router();
const PromptConfig = require('../models/PromptConfig');

// GET /api/prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await PromptConfig.find();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// PUT /api/prompts/:id
router.put('/:id', async (req, res) => {
  try {
    const { templateContent } = req.body;
    const prompt = await PromptConfig.findByIdAndUpdate(
      req.params.id, 
      { templateContent }, 
      { new: true }
    );
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

module.exports = router;
