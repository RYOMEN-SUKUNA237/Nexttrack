const jwt = require('jsonwebtoken');
const { supabase } = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexttrack_fallback_secret_2025';

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = header.split(' ')[1];

  // ── 1) Try JWT first (covers fallback admin + any JWT-signed token) ────────
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      full_name: payload.full_name || 'Next Track Admin',
      role: payload.role || 'admin',
    };
    return next();
  } catch (_jwtErr) {
    // Not a local JWT — try Supabase
  }

  // ── 2) Try Supabase access token ──────────────────────────────────────────
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name || 'Admin User')
        .replace(/nexus global track/i, 'Next Track Admin'),
      role: 'admin',
    };
    return next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { authMiddleware };
