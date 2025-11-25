const mongoose = require('mongoose');
const Email = require('./models/Email');
require('dotenv').config();

async function checkEmails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const total = await Email.countDocuments();
    const processed = await Email.countDocuments({ isProcessed: true });
    const unprocessed = await Email.countDocuments({ isProcessed: false });
    
    console.log(`Total: ${total}`);
    console.log(`Processed: ${processed}`);
    console.log(`Unprocessed: ${unprocessed}`);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

checkEmails();
