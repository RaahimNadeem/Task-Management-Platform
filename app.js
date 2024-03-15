document.addEventListener("DOMContentLoaded", getTasks);
document.querySelector(".task-button").addEventListener("click", addTask);
document.querySelector(".task-list").addEventListener("click", deleteOrCompleteTask);
document.querySelector(".filter-tasks").addEventListener("change", filterTasks);

function addTask(e) {
  e.preventDefault(); // Prevent the form from submitting
  const taskText = document.querySelector(".task-input").value;

  if (!taskText.trim()) return; // Ignore empty tasks

  // Send the new task to the server
  fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    // Convert the task to JSON (this is important because the server expects JSON data)
    body: JSON.stringify({ task: taskText }),
  })
  // Convert the response to JSON
  .then(response => response.json())
  // Create the task in the DOM (creating in DOM is important because DOM is the web interface)
  .then(task => {
    // Create the task in the DOM
    createTaskDOM(task); 
    // Clear the input
    document.querySelector(".task-input").value = ''; 
  })
  // Log any errors
  .catch(error => console.error('Error:', error));
}

// Function to create a task in the DOM
function createTaskDOM(task) {
  // Get the task list
  const taskList = document.querySelector(".task-list");
  const taskDiv = document.createElement("div");

  // Add the task to the list
  taskDiv.classList.add("task");
  taskDiv.setAttribute('data-id', task.id);

  // Create the task
  const newTask = document.createElement("li");
  // Set the task text
  newTask.innerText = task.task;
  // Add the task class
  newTask.classList.add("task-item");
  taskDiv.appendChild(newTask);

  // Check if the task is completed 
  // This is so that the task can be styled correctly when the server is restarted
  if (task.completed === 1) {
    taskDiv.classList.add("completed");
  }

  // Create the buttons
  const completedButton = document.createElement("button");
  completedButton.innerHTML = `<i class="fas fa-check"></i>`;
  completedButton.classList.add("complete-btn");
  // Add the button to the task
  taskDiv.appendChild(completedButton);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
  trashButton.classList.add("trash-btn");
  taskDiv.appendChild(trashButton);

  taskList.appendChild(taskDiv);
}

// Function to get all tasks from the server
function getTasks() {
  fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
      tasks.forEach(createTaskDOM);
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete or complete a task
function deleteOrCompleteTask(e) {
  const item = e.target;
  const task = item.parentElement;

  // Handle completion
  if (item.classList[0] === "complete-btn") {
    // Get the task id
    const taskId = task.getAttribute('data-id');
    // Send the task id to the server
    toggleTaskCompletion(taskId, task);
  }

  // Handle deletion
  if (item.classList[0] === "trash-btn") {
    // Get the task id
    const taskId = task.getAttribute('data-id');
    // Send the task id to the server
    deleteTask(taskId, task);
  }
}

// Function to delete a task
function deleteTask(taskId, taskElement) {
  // Fetch the task id that needs to be deleted
  fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE'
  })
  // Log the response
  .then(response => response.text())
  .then(message => {
    console.log(message);
    // 'fall' helps animate the task deletion 
    taskElement.classList.add("fall");
    // Wait for the transition to end before removing the task from the DOM
    taskElement.addEventListener("transitionend", () => {
      taskElement.remove();
    });
  })
  .catch(error => console.error('Error:', error));
}


// Function to toggle a task's completion status
function toggleTaskCompletion(taskId, taskElement) {
  const isCompleted = taskElement.classList.contains("completed");
  // Toggle the completion status
    // If the task was uncompleted, the new status will be 1 (completed)
    // Else, if the task was completed, the new status will be 0 (uncompleted)
  const newStatus = isCompleted ? 0 : 1;

  // Fetch the id of the task that needs to be updated
  fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed: newStatus }),
  })
  // Log the response
  .then(response => {
    // If the response is ok, toggle the task's completion status
    if (response.ok) {
      taskElement.classList.toggle("completed", newStatus);
    }
    return response.text();
  })
  .then(message => console.log(message))
  .catch(error => console.error('Error:', error));
}


// Function to filter tasks
function filterTasks(e) {
  // Get all tasks
  const tasks = document.querySelector(".task-list").childNodes;
  // Run through all tasks
  tasks.forEach(task => {
    // Hide or show tasks based on the selected filter
    switch (e.target.value) {
      // If the filter is "all", show all tasks
      case "all":
        task.style.display = "flex";
        break;
      // If the filter is "completed", show only completed tasks
      case "completed":
        // If the task has the completed class, show it
        if (task.classList.contains("completed")) {
          task.style.display = "flex";
        } 
        // Else, no task will be shown
        else 
        {
          task.style.display = "none";
        }
        break;
      // If the filter is "uncompleted", show only uncompleted tasks
      case "uncompleted":
        if (!task.classList.contains("completed")) 
        {
          task.style.display = "flex";
        } 
        else 
        {
          task.style.display = "none";
        }
        break;
    }
  });
}
