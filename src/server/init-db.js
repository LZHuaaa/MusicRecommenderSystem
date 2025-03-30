const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres' // Connect to default postgres database first
});

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query(`
      SELECT 'CREATE DATABASE ${process.env.DB_NAME}'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${process.env.DB_NAME}')
    `);

    // Close the connection to postgres database
    await pool.end();

    // Create new pool connection to the music_app_db
    const dbPool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });

    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, '../../database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql.split(';').filter(statement => statement.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await dbPool.query(statement);
      }
    }

    console.log('Database initialized successfully!');
    await dbPool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 