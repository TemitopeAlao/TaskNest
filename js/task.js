const todoList = document.getElementById("todoList");

function createTaskCard(task) {
  return `
    <div class="task-card">
      <div class="task-top">
        <span class="task-title">${task.title}</span>
        <span class="task-date">${task.date}</span>
      </div>
      <p class="task-desc">${task.description}</p>
      <div class="task-bottom">
        <span class="priority ${task.priority.toLowerCase()}">${
    task.priority
  }</span>
        <button class="complete-btn">Complete</button>
      </div>
    </div>
  `;
}

export function addTask(task) {
  todoList.innerHTML += createTaskCard(task);
}
