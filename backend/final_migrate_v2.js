const mysql = require('mysql2');
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "varsha@123456",
  database: "examseating",
};

const connection = mysql.createConnection(dbConfig);
connection.query('ALTER TABLE users ADD COLUMN roll_number VARCHAR(50)', (err) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err.message);
    }
  } else {
    console.log('Column added!');
  }
  connection.end();
  process.exit(0);
});
