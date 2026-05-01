try {
  const app = require('./server/index.js');
  console.log('App loaded successfully. Type:', typeof app);
} catch (err) {
  console.error('Crash during load:', err);
}
