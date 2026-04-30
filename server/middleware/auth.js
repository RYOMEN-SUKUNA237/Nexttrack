const jwt = require('jsonwebtoken');
const { supabase } = require('../db');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
  process.exit(1);
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    // Verify using Supabase exclusively
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name || 'Admin User').replace(/nexus global track/i, 'Next Trace Admin'),
      role: 'admin' // Supabase users are considered admins for the dashboard
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { authMiddleware };
