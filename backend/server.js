require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-agent';

const ingestRoutes = require('./routes/ingestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const generalChatRoutes = require('./routes/generalChatRoutes');

const promptRoutes = require('./routes/promptRoutes');
const vectorStore = require('./services/vectorStore');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize Vector Store
    vectorStore.initCollection();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// Routes
app.use('/api/emails', ingestRoutes); // This works because ingestRoutes has GET /
app.use('/api/ingest', ingestRoutes); // This works because ingestRoutes has POST /
app.use('/api/chat', chatRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/general-chat', generalChatRoutes);

app.get('/', (req, res) => {
  res.send('Email Agent API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
