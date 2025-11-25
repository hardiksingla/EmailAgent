const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isProcessed: { type: Boolean, default: false },
  category: { type: String },
  actionItems: [{
    task: String,
    deadline: String,
    completed: { type: Boolean, default: false }
  }],
  summary: { type: String },
  status: { 
    type: String, 
    enum: ['Unread', 'Drafted', 'Replied'], 
    default: 'Unread' 
  }
});

module.exports = mongoose.model('Email', emailSchema);
