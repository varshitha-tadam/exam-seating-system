const db = require('./db');
db.query("SELECT email, role FROM users WHERE email='admin@examseat.com'", (err, results) => {
  if (err) console.error(err);
  else console.log('Admin user:', results);
  process.exit(0);
});
