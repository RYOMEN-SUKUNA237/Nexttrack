const express = require('express');
const { supabase } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Input sanitizer
function sanitize(str, maxLen = 255) {
  if (typeof str !== 'string') return str;
  return str.trim().slice(0, maxLen);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const username = sanitize(req.body.username, 100);
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Authenticate via Supabase Auth only
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error || !data?.user || !data?.session) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Supabase Auth succeeded
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: (data.user.user_metadata?.full_name || 'Admin User').replace(/nexus global track/i, 'Next Track Admin'),
        role: 'admin'
      },
      token: data.session.access_token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Return user object populated by authMiddleware directly
    res.json({ user: req.user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
