const db = require('./db');
db.query("SELECT COUNT(*) as count FROM exams", (err, r1) => {
  console.log('Exams count:', r1 ? r1[0].count : 'Error: ' + err.message);
  db.query("SELECT COUNT(*) as count FROM halls", (err, r2) => {
    console.log('Halls count:', r2 ? r2[0].count : 'Error: ' + err.message);
    process.exit(0);
  });
});
