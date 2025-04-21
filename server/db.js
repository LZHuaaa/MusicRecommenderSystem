const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Log environment variables (without sensitive data)
console.log('Database Configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.message);
    console.error('Error stack:', err.stack);
    return;
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 