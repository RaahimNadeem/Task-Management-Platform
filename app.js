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
    body: JSON.stringify({ task: taskText }),
  })
  .then(response => response.json())
  .then(task => {
    createTaskDOM(task); // Create the task in the DOM
    document.querySelector(".task-input").value = ''; // Clear the input
  })
  .catch(error => console.error('Error:', error));
}

function createTaskDOM(task) {
  const taskList = document.querySelector(".task-list");
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task");
  taskDiv.setAttribute('data-id', task.id); // Set the task ID

  const newtask = document.createElement("li");
  newtask.innerText = task.task;
  newtask.classList.add("task-item");
  taskDiv.appendChild(newtask);

  const completedButton = document.createElement("button");
  completedButton.innerHTML = `<i class="fas fa-check"></i>`;
  completedButton.classList.add("complete-btn");
  taskDiv.appendChild(completedButton);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
  trashButton.classList.add("trash-btn");
  taskDiv.appendChild(trashButton);

  taskList.appendChild(taskDiv);
}

function getTasks() {
  fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
      tasks.forEach(createTaskDOM);
    })
    .catch(error => console.error('Error:', error));
}

function deleteOrCompleteTask(e) {
  const item = e.target;
  const task = item.parentElement;

  // Handle completion
  if (item.classList[0] === "complete-btn") {
    const taskId = task.getAttribute('data-id');
    toggleTaskCompletion(taskId, task);
  }

  // Handle deletion
  if (item.classList[0] === "trash-btn") {
    const taskId = task.getAttribute('data-id');
    deleteTask(taskId, task);
  }
}

function deleteTask(taskId, taskElement) {
  fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE'
  })
  .then(response => response.text())
  .then(message => {
    console.log(message);
    taskElement.classList.add("fall");
    taskElement.addEventListener("transitionend", () => {
      taskElement.remove();
    });
  })
  .catch(error => console.error('Error:', error));
}

function toggleTaskCompletion(taskId, taskElement) {
  const isCompleted = taskElement.classList.contains("completed");
  // Toggle the completion status
  const newStatus = isCompleted ? 0 : 1;

  fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed: newStatus }),
  })
  .then(response => {
    if (response.ok) {
      taskElement.classList.toggle("completed", newStatus);
    }
    return response.text();
  })
  .then(message => console.log(message))
  .catch(error => console.error('Error:', error));
}


function filterTasks(e) {
  const tasks = document.querySelector(".task-list").childNodes;
  tasks.forEach(task => {
    switch (e.target.value) {
      case "all":
        task.style.display = "flex";
        break;
      case "completed":
        if (task.classList.contains("completed")) {
          task.style.display = "flex";
        } else {
          task.style.display = "none";
        }
        break;
      case "uncompleted":
        if (!task.classList.contains("completed")) {
          task.style.display = "flex";
        } else {
          task.style.display = "none";
        }
        break;
    }
  });
}
