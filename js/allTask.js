import {
  updateTaskCompleted,
  deleteTask,
  updateTaskBackend,
  createTask,
  allTasks,
  refreshTasks,
} from "./api.js";
import { createTaskCard } from "./task.js";
import { setLoading, showToast } from "./auth.js";
import { getFullDueDate } from "./dashboard.js";

const allTasksList = document.getElementById("allTasksList");
const addTaskForm = document.getElementById("addTaskForm");
const sortDueCheckbox = document.getElementById("sortDueCheckbox");
const taskForm = addTaskForm.querySelector(".task-form");
const doneBtn = taskForm.querySelector(".done-btn");
const modalTitle = addTaskForm.querySelector(".form-title h2");
const todoList = document.getElementById("todoList");
const completedList = document.getElementById("completedList");

export function renderAllTasks() {
  const sortedTasks = [...allTasks].sort((a, b) => b.created_at - a.created_at);
  allTasksList.innerHTML = sortedTasks
    .map((task) => createTaskCard(task, true))
    .join("");
}

export function renderDashboardTasks() {
  const now = new Date();
  allTasks.forEach((task) => {
    const due = getFullDueDate(task);
    if (!due) return;
    if (!task.completed) task.status = due < now ? "Overdue" : "In Progress";
  });

  todoList.innerHTML = "";
  completedList.innerHTML = "";

  allTasks
    .filter((t) => !t.completed)
    .slice(0, 3)
    .forEach((t) => (todoList.innerHTML += createTaskCard(t)));

  allTasks
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 2)
    .forEach((t) => (completedList.innerHTML += createTaskCard(t)));
}

async function reloadAfterAction() {
  await refreshTasks();
  renderAllTasks();
  renderDashboardTasks();
}

allTasksList.addEventListener("click", async (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;

  const id = card.dataset.id;
  const task = allTasks.find((t) => t.id == id);
  if (!task) return;

  try {
    if (e.target.closest(".complete-btn")) {
      await updateTaskCompleted(id, true);
      showToast("Task completed");
      await reloadAfterAction();
      return;
    }

    if (e.target.closest(".undo-btn")) {
      await updateTaskCompleted(id, false);
      showToast("Task moved to in-progress");
      await reloadAfterAction();
      return;
    }

    if (e.target.closest(".delete-btn")) {
      if (!confirm("Are you sure you want to delete this task?")) return;
      await deleteTask(id);
      showToast("Task deleted");
      await reloadAfterAction();
      return;
    }

    if (e.target.closest(".edit-btn")) {
      openEditModal(task);
      return;
    }
  } catch (err) {
    console.error("Task action failed", err);
    showToast("Action failed", "error");
  }
});

let editingTask = null;

function openEditModal(task) {
  editingTask = task;
  addTaskForm.style.display = "block";
  modalTitle.textContent = "Edit Task";

  taskForm.querySelector("#title").value = task.title || "";
  taskForm.querySelector("#description").value = task.description || "";
  taskForm.querySelector("#date").value = task.due_date
    ? new Date(Number(task.due_date)).toISOString().slice(0, 10)
    : "";
  taskForm.querySelector("#time").value = task.due_time || "";

  const radios = taskForm.querySelectorAll('input[name="priority"]');
  radios.forEach((r) => {
    r.checked = r.value.toLowerCase() === (task.priority || "").toLowerCase();
  });

  taskForm.querySelector("#title").focus();
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isEdit = editingTask ? true : false;

  const taskData = {
    title: taskForm.querySelector("#title").value.trim(),
    description: taskForm.querySelector("#description").value.trim(),
    priority:
      taskForm.querySelector('input[name="priority"]:checked')?.value || "low",
    due_date: taskForm.querySelector("#date").value
      ? new Date(taskForm.querySelector("#date").value).getTime()
      : null,
    due_time: taskForm.querySelector("#time").value || null,
    completed: editingTask ? editingTask.completed : false,
  };

  try {
    setLoading(doneBtn, true);

    if (isEdit) {
      await updateTaskBackend(editingTask.id, taskData);
      showToast("Task updated");
    } else {
      await createTask(taskData);
      showToast("Task created");
    }

    setLoading(doneBtn, false);
    closeModal();
    await reloadAfterAction();
  } catch (err) {
    console.error(err);
    setLoading(doneBtn, false);
    showToast(isEdit ? "Update failed" : "Creation failed", "error");
  }
});

function closeModal() {
  addTaskForm.style.display = "none";
  modalTitle.textContent = "Create New Task";
  taskForm.reset();
  editingTask = null;
}

addTaskForm.addEventListener("click", (e) => {
  if (e.target === addTaskForm) closeModal();
});

allTasksList.addEventListener("click", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;

  if (e.target.closest(".complete-btn")) return;
  if (e.target.closest(".undo-btn")) return;
  if (e.target.closest(".delete-btn")) return;
  if (e.target.closest(".edit-btn")) return;

  const descShort = card.querySelector(".desc-short");
  const descFull = card.querySelector(".desc-full");
  const showMore = card.querySelector(".show-more");

  if (!descShort || !descFull || !showMore) return;

  const isExpanded = descFull.style.display === "inline";
  descFull.style.display = isExpanded ? "none" : "inline";
  descShort.style.display = isExpanded ? "inline" : "none";
  showMore.textContent = isExpanded ? "...show more" : "...show less";
});

sortDueCheckbox.addEventListener("change", () => {
  let tasksToRender;

  if (sortDueCheckbox.checked) {
    tasksToRender = [...allTasks].sort((a, b) => a.due_date - b.due_date);
  } else {
    tasksToRender = [...allTasks].sort((a, b) => b.created_at - a.created_at);
  }

  allTasksList.innerHTML = tasksToRender
    .map((task) => createTaskCard(task, true))
    .join("");
});

window.addEventListener("DOMContentLoaded", reloadAfterAction);
