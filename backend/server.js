import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const ollama = new Ollama({ 
  host: process.env.OLLAMA_HOST || 'http://localhost:11434' 
});

// Load your personal data
const aboutKevin = readFileSync(join(__dirname, 'data', 'about-kevin.txt'), 'utf8');

// Extract relevant sections based on keywords
function extractSection(context, sectionKeyword) {
  const lines = context.split('\n');
  let section = [];
  let inSection = false;
  
  for (let line of lines) {
    if (line.toUpperCase().includes(sectionKeyword)) {
      inSection = true;
    }
    if (inSection && line.startsWith('# ') && !line.toUpperCase().includes(sectionKeyword)) {
      break;
    }
    if (inSection) {
      section.push(line);
    }
  }
  return section.join('\n');
}

// Get relevant context based on the question
function getRelevantContext(question, fullContext) {
  const q = question.toLowerCase();
  
  // Project-related questions
  if (q.includes('project') || q.includes('build') || q.includes('app') || q.includes('hackathon') || q.includes('game')) {
    return extractSection(fullContext, 'PROJECT PORTFOLIO');
  }
  
  // Skills and technology questions
  if (q.includes('skill') || q.includes('tech') || q.includes('programming') || q.includes('language') || q.includes('framework')) {
    return extractSection(fullContext, 'TECHNICAL SKILLS');
  }
  
  // Work experience questions
  if (q.includes('work') || q.includes('job') || q.includes('experience') || q.includes('dalhousie')) {
    return extractSection(fullContext, 'WORK EXPERIENCE');
  }
  
  // Personal background questions
  if (q.includes('who') || q.includes('background') || q.includes('about') || q.includes('personality') || q.includes('hobby') || q.includes('interest')) {
    return extractSection(fullContext, 'PERSONAL BACKGROUND');
  }
  
  // Learning and philosophy questions
  if (q.includes('learn') || q.includes('philosophy') || q.includes('approach') || q.includes('goal') || q.includes('future')) {
    const learning = extractSection(fullContext, 'LEARNING PHILOSOPHY');
    const goals = extractSection(fullContext, 'FUTURE GOALS');
    return learning + '\n\n' + goals;
  }
  
  // For general questions, return the most relevant parts (personal + key highlights)
  const personal = extractSection(fullContext, 'PERSONAL BACKGROUND');
  const recentProjects = fullContext.split('## WiFi Channel Scanner')[0] + fullContext.split('## WiFi Channel Scanner')[1]?.split('##')[0] || '';
  return personal + '\n\n' + recentProjects;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // Get only the relevant context to make responses faster
  const relevantContext = getRelevantContext(message, aboutKevin);
  
  const prompt = `${relevantContext}

User question: ${message}

Kevin's response in first person (as if Kevin is talking directly):`;

  try {
    const response = await ollama.generate({
      model: 'tinyllama:1.1b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 100,
        top_k: 20,
        top_p: 0.9,
        repeat_penalty: 1.1,
        num_ctx: 2048
      }
    });

    // Clean up the response
    let answer = response.response.trim();
    
    // Remove any leaked instructions or formatting issues
    if (answer.includes('CRITICAL RESPONSE RULES') || answer.includes('User asks:') || answer.includes('I respond:') || answer.includes('Kevin\'s response')) {
      answer = 'I\'m a computer science student at Dalhousie University! I love building projects and learning new tech. What would you like to know about me?';
    }
    
    // Aggressively fix third-person references to first person
    answer = answer.replace(/Kevin is/gi, 'I am');
    answer = answer.replace(/Kevin has/gi, 'I have');
    answer = answer.replace(/Kevin's/gi, 'my');
    answer = answer.replace(/Kevin was/gi, 'I was');
    answer = answer.replace(/Kevin can/gi, 'I can');
    answer = answer.replace(/Kevin would/gi, 'I would');
    answer = answer.replace(/Kevin will/gi, 'I will');
    answer = answer.replace(/Kevin does/gi, 'I do');
    answer = answer.replace(/Kevin loves/gi, 'I love');
    answer = answer.replace(/Kevin enjoys/gi, 'I enjoy');
    answer = answer.replace(/Kevin built/gi, 'I built');
    answer = answer.replace(/Kevin worked/gi, 'I worked');
    answer = answer.replace(/Kevin learned/gi, 'I learned');
    
    // Remove "Kevin" when it's used as a standalone reference
    answer = answer.replace(/\bKevin\b/gi, 'I');

    res.json({ 
      success: true, 
      answer: answer,
      model: 'tinyllama:1.1b'
    });
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'I\'m having trouble thinking right now. Try again in a moment!' 
    });
  }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Kevin AI API running on port ${PORT}`);
});