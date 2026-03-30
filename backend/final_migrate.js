const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "varsha@123456",
    database: process.env.DB_NAME || "examseating",
  });

  try {
    await connection.query('ALTER TABLE users ADD COLUMN roll_number VARCHAR(50)');
    console.log('✅ Column roll_number added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('ℹ️ Column roll_number already exists.');
    } else {
      console.error('❌ Error adding column:', err.message);
    }
  } finally {
    await connection.end();
  }
}

migrate();
 bitumen
