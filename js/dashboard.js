import { showToast } from "./auth.js";
import { createTodo, getUserRecord } from "./api.js";

const fileInput = document.getElementById("file");
const avatarImg = document.getElementById("avatar");
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
const doneBtn = document.querySelector(".done-btn");

window.addEventListener("DOMContentLoaded", async () => {
  const user = await getUserRecord();
  console.log(user);
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const firstName = user.name.trim().split(" ")[0];
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  document.querySelector(".user-name").textContent = displayName;
  document.querySelector(".profile-info .user_name").textContent = user.name;
  document.querySelector(".profile-info .user_email").textContent = user.email;
});

const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) avatarImg.src = savedAvatar;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarImg.src = e.target.result;
    localStorage.setItem("userAvatar", e.target.result);
  };
  reader.readAsDataURL(file);
});

dashboardNavList.forEach((navList) => {
  navList.addEventListener("click", () => {
    dashboardNavList.forEach((item) => item.classList.remove("clicked-nav"));
    navList.classList.add("clicked-nav");
  });
});

const logoutBtn = document.querySelector(".logout");

logoutBtn.addEventListener("click", () => {
  const choice = confirm("Are you sure you want to logout?");

  if (!choice) return;

  showToast("You have been logged out successfully");

  localStorage.removeItem("userToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userAvatar");

  setTimeout(() => {
    window.location.href = "landing.html";
  }, 1000);
});

function setCircleProgress(circleEl, percent, status) {
  const span = circleEl.querySelector("span");
  let color =
    status === "Overdue"
      ? "red"
      : status === "In Progress"
      ? "#0225FF"
      : "#05A301";
  circleEl.style.background = `conic-gradient(${color} 0deg ${
    percent * 3.6
  }deg, #eee ${percent * 3.6}deg 360deg)`;
  span.textContent = `${percent}%`;
}

setCircleProgress(circles[0], 70, "Completed");
setCircleProgress(circles[1], 40, "In Progress");
setCircleProgress(circles[2], 10, "Overdue");

function openTaskModal() {
  todoList.innerHTML = "";
  addTaskForm.style.display = "block";
}

function closeTaskModal() {
  addTaskForm.style.display = "none";
}

addNewTaskBtn.addEventListener("click", openTaskModal);
addTaskBtn.addEventListener("click", openTaskModal);
goBack.addEventListener("click", (e) => {
  e.preventDefault();
  closeTaskModal();
});

addTaskForm.addEventListener("click", (e) => {
  if (e.target === addTaskForm) closeTaskModal();
});

calendarTrigger.addEventListener("click", () => {
  headerDatePicker.style.display = "block";
});

function updateHeaderDate(date = new Date()) {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  dayEl.textContent = weekdays[date.getDay()];
  dateEl.textContent = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

updateHeaderDate();

doneBtn.addEventListener("click", createTodo);
