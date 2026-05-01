const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('   On Vercel: add them in Project Settings → Environment Variables.');
  console.error('   Locally:   check server/.env exists and has the correct values.');
  // Removed process.exit(1) so Vercel doesn't throw 500 FUNCTION_INVOCATION_FAILED on health checks
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test DB connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to Supabase PostgreSQL'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = { pool, supabase };
