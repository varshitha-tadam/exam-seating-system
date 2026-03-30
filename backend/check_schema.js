const db = require('./db');
db.query("DESCRIBE exams", (err, results) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Exams columns:', results.map(r => r.Field));
  }
  process.exit(0);
});
