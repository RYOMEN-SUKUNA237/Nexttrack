const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Hardcoded fallback admin ──────────────────────────────────────────────
// Used when Supabase auth is down or env vars are missing on Vercel
const FALLBACK_EMAIL    = 'admin@nexttrack.io';
const FALLBACK_PASSWORD = 'NextTrack2025!';
const JWT_SECRET        = process.env.JWT_SECRET || 'nexttrack_fallback_secret_2025';

function makeFallbackToken() {
  return jwt.sign(
    { sub: 'fallback-admin-id', email: FALLBACK_EMAIL, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

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

    // ── 1) Hardcoded fallback ── always works, no DB needed ─────────────────
    if (username === FALLBACK_EMAIL && password === FALLBACK_PASSWORD) {
      console.log('✅ Fallback admin login used');
      return res.json({
        user: {
          id: 'fallback-admin-id',
          email: FALLBACK_EMAIL,
          full_name: 'Next Track Admin',
          role: 'admin',
        },
        token: makeFallbackToken(),
      });
    }

    // ── 2) Supabase Auth ─────────────────────────────────────────────────────
    const supabaseReady = process.env.SUPABASE_URL
      && process.env.SUPABASE_SERVICE_ROLE_KEY
      && !process.env.SUPABASE_URL.includes('dummy');

    if (!supabaseReady) {
      console.warn('⚠️  Supabase not configured — only fallback admin is available.');
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error || !data?.user || !data?.session) {
      console.error('Supabase auth error:', error?.message || 'Unknown error',
        'URL set:', !!process.env.SUPABASE_URL);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: (data.user.user_metadata?.full_name || 'Admin User')
          .replace(/nexus global track/i, 'Next Track Admin'),
        role: 'admin',
      },
      token: data.session.access_token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
