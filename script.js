    function updateClock() {
  const now = new Date();

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  };

  const dateOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  };

  const clockEl = document.getElementById("live-clock");
  clockEl.textContent =
    now.toLocaleTimeString("en-IN", options) +
    " | " +
    now.toLocaleDateString("en-IN", dateOptions);
}


setInterval(updateClock, 1000);
updateClock();


function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const icon = document.getElementById("theme-icon");
  if (icon) {
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
  }
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}
(function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    const icon = document.getElementById("theme-icon");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  }
})();


function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[tag]));
}

function saveNotes() {
  const notesInput = document.getElementById("quick-notes");
  if (!notesInput) return;
  const notes = notesInput.value.trim();
  if (!notes) {
    alert("Please write some notes before saving!");
    return;
  }
  const timestamp = new Date().toLocaleString();
  let history = JSON.parse(localStorage.getItem("notes-history") || "[]");
  history.push({ id: Date.now(), timestamp, note: notes });
  localStorage.setItem("notes-history", JSON.stringify(history));
  notesInput.value = "";
  updateNotesHistory();
}

function updateNotesHistory() {
  const notesHistory = document.getElementById("notes-history");
  if (!notesHistory) return;
  let history = JSON.parse(localStorage.getItem("notes-history") || "[]");
  if (history.length === 0) {
    notesHistory.innerHTML = "<p>No notes saved yet.</p>";
    return;
  }
  notesHistory.innerHTML = "";
  history.forEach((item) => {
    const div = document.createElement("div");
    div.className = "mb-2 border p-2 rounded bg-light";
    div.innerHTML = `
      <small class="text-muted">${item.timestamp}</small>
      <div class="note-text mt-1">${escapeHTML(item.note)}</div>
      <button class="btn btn-sm btn-danger mt-2" onclick="deleteNote(${item.id})">Delete</button>
      <button class="btn btn-sm btn-secondary mt-2 ms-2" onclick="editNotePrompt(${item.id})">Edit</button>
    `;
    notesHistory.appendChild(div);
  });
}

function deleteNote(id) {
  let history = JSON.parse(localStorage.getItem("notes-history") || "[]");
  history = history.filter((note) => note.id !== id);
  localStorage.setItem("notes-history", JSON.stringify(history));
  updateNotesHistory();
}

function editNotePrompt(id) {
  let history = JSON.parse(localStorage.getItem("notes-history") || "[]");
  const note = history.find((n) => n.id === id);
  if (!note) return;
  const newNote = prompt("Edit your note:", note.note);
  if (newNote !== null) {
    note.note = newNote.trim();
    localStorage.setItem("notes-history", JSON.stringify(history));
    updateNotesHistory();
  }
}
window.onload = updateNotesHistory; 


let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
const todoContainer = document.getElementById("todo-container");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTodo() {
  const taskInput = document.getElementById("todo-input");
  const timelineInput = document.getElementById("todo-timeline");
  const recurrenceSelect = document.getElementById("recurrence-select");

  if (!taskInput || !timelineInput || !recurrenceSelect) return;

  const taskText = taskInput.value.trim();
  const timeline = timelineInput.value;
  const recurrence = recurrenceSelect.value;

  if (!taskText) {
    alert("Please enter a task.");
    return;
  }
  if (!timeline) {
    alert("Please set a date and time for the task.");
    return;
  }

  tasks.push({
    id: Date.now(),
    text: taskText,
    deadline: timeline,
    recurrence,
    completed: false,
  });

  taskInput.value = "";
  timelineInput.value = "";
  recurrenceSelect.value = "none";

  saveTasks();
  renderTasks();
}

function clearTodoList() {
  if (confirm("Are you sure you want to clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTodo(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function updateTask(id, newText, newDeadline, newRecurrence) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.text = newText;
    task.deadline = newDeadline;
    task.recurrence = newRecurrence;
    saveTasks();
    renderTasks();
  }
}

function editTaskPrompt(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task text:", task.text);
  if (newText === null) return;
  if (!newText.trim()) {
    alert("Task text cannot be empty!");
    return;
  }
  const newDeadline = prompt("Edit deadline (YYYY-MM-DDTHH:mm):", task.deadline);
  if (newDeadline === null) return;

  if (isNaN(new Date(newDeadline).getTime())) {
    alert("Invalid date format!");
    return;
  }
  const recurrenceOptions = ["none", "daily", "weekly", "monthly"];
  const newRecurrence = prompt(
    "Edit recurrence (none, daily, weekly, monthly):",
    task.recurrence
  );
  if (newRecurrence === null) return;
  if (!recurrenceOptions.includes(newRecurrence)) {
    alert("Invalid recurrence option!");
    return;
  }
  updateTask(id, newText.trim(), newDeadline, newRecurrence);
}

function renderTasks() {
  if (!todoContainer) return;
  todoContainer.innerHTML = "";

  if (tasks.length === 0) {
    todoContainer.innerHTML = "<p>No tasks yet.</p>";
    return;
  }

  const now = new Date();

  tasks.forEach((task) => {
    const deadlineDate = new Date(task.deadline);
    let isOverdue = !task.completed && deadlineDate < now;


    const taskDiv = document.createElement("div");
    taskDiv.className = "list-group-item d-flex justify-content-between align-items-center mb-2 flex-wrap";
    if (isOverdue) {
      taskDiv.classList.add("bg-warning-subtle");
    }


    const leftDiv = document.createElement("div");
    leftDiv.className = "d-flex flex-column";

    const taskTextSpan = document.createElement("span");
    taskTextSpan.textContent = task.text;
    taskTextSpan.className = "fw-bold";
    if (task.completed) {
      taskTextSpan.style.textDecoration = "line-through";
      taskTextSpan.style.color = "#888";
    }

    const deadlineSpan = document.createElement("small");
    deadlineSpan.style.color = isOverdue ? "red" : "#666";
    deadlineSpan.textContent = `Due: ${deadlineDate.toLocaleString()}`;

    leftDiv.appendChild(taskTextSpan);
    leftDiv.appendChild(deadlineSpan);

  
    if (isOverdue) {
      const delayMs = now - deadlineDate;
      const delayMinutes = Math.floor(delayMs / 60000);
      const delayMessage = document.createElement("small");
      delayMessage.textContent = `Overdue by ${delayMinutes} min`;
      delayMessage.style.color = "red";
      leftDiv.appendChild(delayMessage);
    }

    
    const btnDiv = document.createElement("div");
    btnDiv.className = "d-flex gap-2 mt-2 mt-md-0";

    const completeBtn = document.createElement("button");
    completeBtn.className = "btn btn-sm btn-outline-success";
    completeBtn.textContent = task.completed ? "Undo" : "Complete";
    completeBtn.onclick = () => toggleComplete(task.id);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-secondary";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTaskPrompt(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTodo(task.id);

    btnDiv.appendChild(completeBtn);
    btnDiv.appendChild(editBtn);
    btnDiv.appendChild(deleteBtn);

    taskDiv.appendChild(leftDiv);
    taskDiv.appendChild(btnDiv);

    todoContainer.appendChild(taskDiv);
  });
}


window.onload = function () {
  updateNotesHistory();
  renderTasks();
};
