const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true },
  draftBody: { type: String, required: true },
  isSent: { type: Boolean, default: false } // Safety mechanism: always false
});

module.exports = mongoose.model('Draft', draftSchema);
