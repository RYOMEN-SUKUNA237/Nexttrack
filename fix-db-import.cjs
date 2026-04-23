const fs = require('fs');
const path = require('path');

const files = [
  'server/routes/shipments.js',
  'server/routes/reviews.js',
  'server/routes/quotes.js',
  'server/routes/messages.js',
  'server/routes/dashboard.js',
  'server/routes/customers.js',
  'server/routes/couriers.js',
  'server/routes/auth.js',
  'server/seed.js'
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace("const pool = require('../db');", "const { pool } = require('../db');");
    content = content.replace("const pool = require('./db');", "const { pool } = require('./db');");
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
