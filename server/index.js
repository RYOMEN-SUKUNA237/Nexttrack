const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const courierRoutes = require('./routes/couriers');
const customerRoutes = require('./routes/customers');
const shipmentRoutes = require('./routes/shipments');
const dashboardRoutes = require('./routes/dashboard');
const messageRoutes = require('./routes/messages');
const quoteRoutes = require('./routes/quotes');
const reviewRoutes = require('./routes/reviews');
const emailRoutes = require('./routes/emails');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.disable('x-powered-by');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                          // server-to-server / curl
    if (origin.startsWith('http://localhost:')) return cb(null, true);  // local dev
    if (origin.startsWith('http://127.0.0.1:')) return cb(null, true);  // local dev alt
    if (origin.endsWith('.vercel.app')) return cb(null, true);          // all Vercel previews & production
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true); // custom domain
    cb(new Error('Blocked by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

app.use(globalLimiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`));
  next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', publicLimiter, messageRoutes);
app.use('/api/quotes', publicLimiter, quoteRoutes);
app.use('/api/reviews', publicLimiter, reviewRoutes);
app.use('/api/emails', emailRoutes);

app.get('/', (req, res) => res.json({ name: 'Next Track API', status: 'running' }));
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  env: {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasDbUrl: !!process.env.DATABASE_URL
  }
}));

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, next) => {
  if (err.message === 'Blocked by CORS') return res.status(403).json({ error: 'Origin not allowed.' });
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🐾 Next Track API running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
