const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./taskmanager.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Database connected');
    db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, completed INTEGER DEFAULT 0)', (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      }
    });
  }
});

module.exports = db;
