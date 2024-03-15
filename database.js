const sqlite3 = require('sqlite3').verbose();
// Open a database connection
const db = new sqlite3.Database('./taskmanager.db', (err) => {
  // If error, print the error message
  if (err) {
    console.error('Error opening database', err.message);
  }
  // Else, print that the connection was successful 
  else 
  {
    console.log('Database connected');
    // Create the tasks table if it doesn't exist
    db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, completed INTEGER DEFAULT 0)', (err) => {
      // If there's an error, print the error message
      if (err) {
        console.error('Error creating table', err.message);
      }
    });
  }
});

// Export the database (this is important to access the database in other files)
module.exports = db;
