const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query("UPDATE messages SET sender_name = 'Next Trace Support' WHERE sender_name ILIKE '%nexus%'"))
  .then(res => console.log('Updated messages:', res.rowCount))
  .catch(console.error)
  .finally(() => client.end());
