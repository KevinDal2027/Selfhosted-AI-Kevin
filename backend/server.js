import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Environment variables
const API_KEY = process.env.API_KEY;
const OLLAMA_HOST = process.env.OLLAMA_HOST;
const PORT = process.env.PORT || 3001;

// Rate limiting - 50 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' }
});

// CORS - allow only your domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ai.kevinqh.com'
  ],
  credentials: true
}));

app.use(express.json());

// API key middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API Key' });
  }
  next();
};

// Ollama client
const ollama = new Ollama({
  host: OLLAMA_HOST
});

// Chat endpoint
app.post('/api/chat', apiKeyAuth, limiter, async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await ollama.generate({
      model: 'kevin', // 👈 your custom model with embedded personal data
      prompt: message,
      stream: false
    });

    let answer = response.response.trim();

    // Fix small reference issues (in case model sometimes uses “Kevin”)
    answer = answer
      .replace(/Kevin is/gi, 'I am')
      .replace(/Kevin has/gi, 'I have')
      .replace(/Kevin's/gi, 'my')
      .replace(/Kevin was/gi, 'I was')
      .replace(/Kevin can/gi, 'I can')
      .replace(/Kevin would/gi, 'I would')
      .replace(/Kevin will/gi, 'I will')
      .replace(/Kevin does/gi, 'I do')
      .replace(/Kevin loves/gi, 'I love')
      .replace(/Kevin enjoys/gi, 'I enjoy')
      .replace(/Kevin built/gi, 'I built')
      .replace(/Kevin worked/gi, 'I worked')
      .replace(/Kevin learned/gi, 'I learned')
      .replace(/\bKevin\b/gi, 'I');

    res.json({
      success: true,
      answer,
      model: 'kevin'
    });
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({
      success: false,
      error: 'I’m having trouble thinking right now. Try again in a moment!'
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const models = await ollama.list();
    res.json({
      status: 'healthy',
      models: models.models,
      ollama: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Ollama not available'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Kevin AI API running on port ${PORT}`);
  console.log(`Environment: API_KEY=${API_KEY ? 'Set' : 'Not set'}, OLLAMA_HOST=${OLLAMA_HOST}`);
});
