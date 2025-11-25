const mongoose = require('mongoose');
const Email = require('./models/Email');
const PromptConfig = require('./models/PromptConfig');
const Draft = require('./models/Draft');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mockInbox = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mock_inbox.json'), 'utf-8'));

const defaultPrompts = [
  {
    promptType: 'categorization',
    templateContent: `
      Analyze the following email and categorize it into ONE of these categories: Important, Work, Personal, Newsletter, Spam.
      
      Subject: {{subject}}
      Body: {{body}}
      
      Return ONLY the category name.
    `
  },
  {
    promptType: 'action_extraction',
    templateContent: `
      Extract action items and deadlines from the following email.
      
      Subject: {{subject}}
      Body: {{body}}
      
      Return a JSON array of objects with keys "task" and "deadline". If no deadline, use "None".
      Example: [{"task": "Submit report", "deadline": "Friday 5pm"}]
      Return ONLY the JSON array.
    `
  },
  {
    promptType: 'reply_generation',
    templateContent: `
      Generate 3 distinct reply options for the following email:
      1. Professional: Formal and polite.
      2. Casual: Friendly and brief.
      3. Concise: Very short, straight to the point.

      Subject: {{subject}}
      Body: {{body}}

      Return a JSON object with keys "professional", "casual", and "concise".
      Example:
      {
        "professional": "Dear...",
        "casual": "Hey...",
        "concise": "Yes..."
      }
      Return ONLY the JSON object.
    `
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Email.deleteMany({});
    await PromptConfig.deleteMany({});
    await Draft.deleteMany({});
    console.log('Cleared existing data');

    // Insert Prompts
    await PromptConfig.insertMany(defaultPrompts);
    console.log('Inserted default prompts');

    // Insert Mock Emails
    await Email.insertMany(mockInbox);
    console.log(`Inserted ${mockInbox.length} mock emails`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
