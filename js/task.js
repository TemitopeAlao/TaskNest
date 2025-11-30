import { getFullDueDate } from "./dashboard.js";
const todoList = document.getElementById("todoList");

function shortenDesc(desc, maxLength = 50) {
  if (!desc) return "";
  if (desc.length > maxLength) return desc.slice(0, maxLength);
  return desc;
}

export function createTaskCard(task, showActions = false) {
  const fullDueDate = getFullDueDate(task);
  const now = new Date();

  const isCompleted = task.status === "Completed";
  const isOverdue = fullDueDate && fullDueDate < now && !isCompleted;

  const formattedDue = fullDueDate
    ? fullDueDate.toLocaleString("en-GB")
    : "No due date";

  const priority = task.priority || "Low";
  const status = task.status || "In Progress";

  const statusClass = isCompleted
    ? "completed"
    : isOverdue
    ? "overdue"
    : "in-progress";
  const priorityClass = priority.toLowerCase();

  let actionButtons = "";
  if (isCompleted) {
    actionButtons =
      '<button class="undo-btn icon-btn"><ion-icon name="arrow-undo-outline"></ion-icon></button>';
  } else if (!isOverdue) {
    actionButtons =
      '<button class="complete-btn icon-btn"><ion-icon name="checkmark-done-outline"></ion-icon></button>';
  } else {
    actionButtons =
      '<button class="delete-btn icon-btn"><ion-icon name="trash-outline"></ion-icon></button>';
  }

  if (showActions && !isOverdue) {
    actionButtons += `
    <button class="edit-btn icon-btn"><ion-icon name="create-outline"></ion-icon></button>
    <button class="delete-btn icon-btn"><ion-icon name="trash-outline"></ion-icon></button>
  `;
  }

  const truncatedDesc = shortenDesc(task.description);

  return `
  <div class="task-card ${isOverdue ? "overdue" : ""}" data-id="${task.id}">
    <div class="task-top">
      <span class="status-circle ${statusClass}"></span>
      <h2 class="task-title ${isCompleted ? "completed-text" : ""}">${
    task.title
  }</h2>
      <span class="task-date">${formattedDue}</span>
    </div>

    <h4 class="task-desc ${isCompleted ? "completed-text" : ""}">
      <span class="desc-short">${truncatedDesc}</span>
      <span class="desc-full" style="display:none;">${task.description}</span>
      ${
        task.description.length > 50
          ? '<span class="show-more">...show more</span>'
          : ""
      }
    </h4>

    <div class="task-bottom">
      <span class="priority">Priority: <span class="${priorityClass}">${priority}</span></span>
      <span class="status ${statusClass}">${status}</span>

      <div class="actionBtn">
        ${actionButtons}
      </div>
    </div>
  </div>
`;
}

export function addTask(task) {
  const cardHTML = createTaskCard(task);
  todoList.insertAdjacentHTML("afterbegin", cardHTML);
}
