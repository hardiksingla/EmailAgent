const mongoose = require('mongoose');

const promptConfigSchema = new mongoose.Schema({
  promptType: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['categorization', 'action_extraction', 'auto_reply', 'reply_generation'], 
  },
  templateContent: { type: String, required: true }
});

module.exports = mongoose.model('PromptConfig', promptConfigSchema);
