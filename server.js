// Importing express, path and body-parser
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // bodPayser is important to parse the request body
const db = require('./database');

// Create a new express application
const app = express();

// Set the port (3000 is the default port)
const PORT = 3000;

// Use the body-parser middleware
app.use(bodyParser.json());
app.use(express.static(__dirname)); 

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(bodyParser.json()); 

// Insert a new task
app.post('/api/tasks', (req, res) => {
  const { task } = req.body;
  // Run the SQL query to insert a new task
  db.run('INSERT INTO tasks (task) VALUES (?)', [task], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error adding task');
    } else {
      res.json({ id: this.lastID, task, completed: 0 });
    }
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {

  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error retrieving tasks');
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error deleting task');
      } else {
        if (this.changes > 0) {
          res.status(200).send(`Task with id ${id} deleted`);
        } else {
          res.status(404).send('Task not found');
        }
      }
    });
  });


  // API to toggle a task's completion status
app.patch('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error updating task');
      } else {
        if (this.changes > 0) {
          res.status(200).send(`Task with id ${id} updated`);
        } else {
          res.status(404).send('Task not found');
        }
      }
    });
  });
  
  
