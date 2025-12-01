import { showToast } from "./auth.js";
import {
  createTask,
  getAllTasks,
  updateTaskCompleted,
  deleteTask,
} from "./api.js";
import { renderAllTasks } from "./allTask.js";
import { allTasks, refreshTasks } from "./api.js";
import { createTaskCard } from "./task.js";
import { getUserRecord } from "./auth.js";

const avatarImg = document.getElementById("avatar");
const fileInput = document.getElementById("file");
const dashboardNavList = document.querySelectorAll(".side__nav-lists li");
const circles = document.querySelectorAll(".circle");
const addTaskForm = document.getElementById("addTaskForm");
const addNewTaskBtn = document.getElementById("addNewTaskBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const goBack = document.querySelector(".form-title button");
const calendarTrigger = document.getElementById("calendarTrigger");
const headerDatePicker = document.getElementById("headerDatePicker");
const dayEl = document.querySelector(".header__date .day");
const dateEl = document.querySelector(".header__date .date");
const todoList = document.getElementById("todoList");
const completedList = document.getElementById("completedList");
const doneBtn = document.querySelector(".done-btn");
const logoutBtn = document.querySelector(".logout");
const searchInput = document.getElementById("search");
const myTaskBtn = document.getElementById("myTaskBtn");
const navToggle = document.getElementById("navToggle");
const sideNav = document.querySelector(".side__nav");
const mainContent = document.querySelector("main");

const overdueAudio = new Audio("../assets/B.mp3");

let localTasks = [];

export function getFullDueDate(task) {
  if (!task.due_date || !task.due_time) return null;
  const date = new Date(Number(task.due_date));
  const [h, m] = task.due_time.split(":").map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

function highlightMatch(text, query) {
  if (!query) return text;
  return text.replace(
    new RegExp(`(${query})`, "gi"),
    '<span class="highlight">$1</span>'
  );
}

function renderDashboardTasks() {
  todoList.innerHTML = "";
  completedList.innerHTML = "";

  const inProgressTasks = localTasks.filter((t) => !t.completed);
  const completedTasks = localTasks
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  if (inProgressTasks.length > 0) {
    inProgressTasks.slice(0, 3).forEach((t) => {
      todoList.innerHTML += createTaskCard(t);
    });
  } else {
    todoList.innerHTML = `
      <button id="addNewTaskBtn" class="task-add-btn">
        <ion-icon name="add-circle-outline"></ion-icon>
      </button>
      <p class="task-placeholder">Create your first task...</p>
    `;

    const newTaskBtn = document.getElementById("addNewTaskBtn");
    if (newTaskBtn) {
      newTaskBtn.addEventListener("click", () => {
        addTaskForm.style.display = "block";
      });
    }
  }
  if (completedTasks.length > 0) {
    completedTasks.slice(0, 2).forEach((t) => {
      completedList.innerHTML += createTaskCard(t);
    });
  }

  updateDashboardCircles();
}

function updateDashboardCircles() {
  const total = localTasks.length || 1;
  const completed = localTasks.filter((t) => t.completed).length;
  const inProgress = localTasks.filter(
    (t) => !t.completed && t.status === "In Progress"
  ).length;
  const overdue = localTasks.filter(
    (t) => !t.completed && t.status === "Overdue"
  ).length;

  const setCircle = (circle, percent, status) => {
    const span = circle.querySelector("span");
    const color =
      status === "Overdue"
        ? "gray"
        : status === "In Progress"
        ? "#0225FF"
        : "#05A301";

    circle.style.background = `conic-gradient(${color} 0deg ${
      percent * 3.6
    }deg, #eee ${percent * 3.6}deg 360deg)`;

    span.textContent = `${Math.round(percent)}%`;
  };

  setCircle(circles[0], (completed / total) * 100, "Completed");
  setCircle(circles[1], (inProgress / total) * 100, "In Progress");
  setCircle(circles[2], (overdue / total) * 100, "Overdue");
}

window.addEventListener("DOMContentLoaded", async () => {
  setInterval(checkDueNotifications, 1000);

  const user = await getUserRecord();
  if (!user) return (window.location.href = "login.html");

  document.querySelector(".user-name").textContent = user.name
    .split(" ")[0]
    .trim();

  document.querySelector(".profile-info .user_name").textContent = user.name;
  document.querySelector(".profile-info .user_email").textContent = user.email;

  await refreshTasks();
  localTasks = allTasks;
  localTasks.sort((a, b) => b.created_at - a.created_at);

  renderDashboardTasks();
});

function checkDueNotifications() {
  const now = new Date();

  localTasks.forEach((task) => {
    if (task.completed) return;

    const due = getFullDueDate(task);
    if (!due) return;

    if (!task.notified && due < now) {
      alert(`Your task "${task.title}" is overdue! Pls delete it`);
      overdueAudio.play();
      task.status = "Overdue";
      task.notified = true;
      renderDashboardTasks();
    }
  });
}

const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) avatarImg.src = savedAvatar;

fileInput.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarImg.src = e.target.result;
    localStorage.setItem("userAvatar", e.target.result);
  };
  reader.readAsDataURL(fileInput.files[0]);
});

dashboardNavList.forEach((item) =>
  item.addEventListener("click", () => {
    dashboardNavList.forEach((i) => i.classList.remove("clicked-nav"));
    item.classList.add("clicked-nav");
  })
);

logoutBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to logout?")) return;

  showToast("You have been logged out");
  localStorage.clear();

  setTimeout(() => (window.location.href = "index.html"), 800);
});

calendarTrigger.addEventListener("click", () => {
  headerDatePicker.style.display = "block";

  setTimeout(() => {
    headerDatePicker.style.display = "none";
  }, 3000);
});

function updateHeaderDate(date = new Date()) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  dayEl.textContent = days[date.getDay()];
  dateEl.textContent = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

updateHeaderDate();

const openTaskModal = () => (addTaskForm.style.display = "block");
const closeTaskModal = () => (addTaskForm.style.display = "none");

addNewTaskBtn.addEventListener("click", openTaskModal);
addTaskBtn.addEventListener("click", openTaskModal);
myTaskBtn?.addEventListener("click", openTaskModal);

goBack.addEventListener("click", (e) => {
  e.preventDefault();
  closeTaskModal();
});

addTaskForm.addEventListener("click", (e) => {
  if (e.target === addTaskForm) closeTaskModal();
});

doneBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!title) return showToast("Enter a title", "error");
  if (!date) return showToast("Select a due date", "error");
  if (!time) return showToast("Select a due time", "error");

  const taskData = {
    title,
    due_date: new Date(date).getTime(),
    due_time: time,
    priority:
      document.querySelector('input[name="priority"]:checked')?.value || "Low",
    description: document.getElementById("description").value,
    completed: false,
  };

  const newTask = await createTask(taskData);
  if (!newTask) return showToast("Failed to create task", "error");

  localTasks.unshift(newTask);
  await refreshTasks();
  localTasks.sort((a, b) => b.created_at - a.created_at);

  renderDashboardTasks();

  allTasks.splice(0, allTasks.length, ...localTasks);

  renderAllTasks();

  addTaskForm.style.display = "none";
  document.querySelector(".task-form").reset();
});

[todoList, completedList].forEach((list) => {
  list.addEventListener("click", async (e) => {
    const actionBtn = e.target.closest(".complete-btn, .undo-btn, .delete-btn");
    if (!actionBtn) return;

    const card = actionBtn.closest(".task-card");
    if (!card) return;

    const id = card.dataset.id;
    const task = localTasks.find((t) => t.id == id);
    if (!task) return;

    try {
      if (actionBtn.classList.contains("complete-btn")) {
        const ok = await updateTaskCompleted(id, true);
        if (!ok) return showToast("Failed", "error");

        task.completed = true;
        task.status = "Completed";

        showToast("Task completed");
      }

      if (actionBtn.classList.contains("undo-btn")) {
        const ok = await updateTaskCompleted(id, false);
        if (!ok) return showToast("Failed", "error");

        task.completed = false;
        const due = getFullDueDate(task);
        task.status = due && due < new Date() ? "Overdue" : "In Progress";

        showToast("Task moved back to in-progress");
      }

      if (actionBtn.classList.contains("delete-btn")) {
        if (!confirm("Delete this task?")) return;

        const ok = await deleteTask(id);
        if (!ok) return showToast("Failed", "error");

        localTasks = localTasks.filter((t) => t.id != id);

        showToast("Task deleted");
      }

      allTasks.splice(0, allTasks.length, ...localTasks);

      renderDashboardTasks();
      renderAllTasks();
    } catch (err) {
      console.error("Task action failed", err);
      showToast("Action failed", "error");
    }
  });
});

// ---------------- SEARCH ----------------
function renderSearchResults(query) {
  const q = query.toLowerCase().trim();
  const filtered = localTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );

  todoList.innerHTML = "";
  completedList.innerHTML = "";
  todoList.classList.add("search-mode");

  if (filtered.length === 0) {
    todoList.innerHTML = `<p>No tasks found for "${query}"</p>`;
    return;
  }

  filtered.forEach((task) => {
    todoList.innerHTML += createTaskCard({
      ...task,
      title: highlightMatch(task.title, query),
      description: highlightMatch(task.description, query),
    });
  });
}

const debounce = (fn, delay = 200) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

searchInput.addEventListener(
  "input",
  debounce((e) => {
    const query = e.target.value;
    if (!query) {
      todoList.classList.remove("search-mode");
      renderDashboardTasks();
      return;
    }
    renderSearchResults(query);
  }, 200)
);

navToggle.addEventListener("click", () => {
  sideNav.classList.toggle("active");
  mainContent.classList.toggle("dimmed");
});

mainContent.addEventListener("click", () => {
  if (sideNav.classList.contains("active")) {
    sideNav.classList.remove("active");
    mainContent.classList.remove("dimmed");
  }
});

todoList.addEventListener("click", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;

  const descShort = card.querySelector(".desc-short");
  const descFull = card.querySelector(".desc-full");
  const showMore = card.querySelector(".show-more");

  if (!descShort || !descFull || !showMore) return;

  const isExpanded = descFull.style.display === "inline";
  descFull.style.display = isExpanded ? "none" : "inline";
  descShort.style.display = isExpanded ? "inline" : "none";

  showMore.textContent = isExpanded ? "...more" : "...show less";
});
