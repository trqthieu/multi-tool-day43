const express = require('express');
const axios = require('axios');
const moment = require('moment');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Tool Security Demo API',
    version: '1.0.0',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// API endpoint using config (with hardcoded secret)
app.get('/api/data', async (req, res) => {
  try {
    // Using API key from config (BAD PRACTICE - for demo only!)
    const response = await axios.get('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'API call failed',
      message: error.message
    });
  }
});

// Sample data endpoint
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ];

  res.json(users);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('WARNING: This app has intentional security issues for educational purposes');
});
