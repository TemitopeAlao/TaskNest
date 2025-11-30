import { createTaskCard } from "./task.js";
import { allTasks, refreshTasks } from "./api.js";
import { showToast } from "./auth.js";
import { renderAllTasks } from "./allTask.js";

const vitalTasksSection = document.getElementById("vital-tasks-section");
const dashboardSection = document.getElementById("dashboard-container");
const tasksSection = document.getElementById("tasks-section");
const vitalTasksNav = document.querySelector(".vital-nav");
const vitalTasksList = document.getElementById("vitalTasksList");
const seeAllTasks = document.getElementById("seeAllTasksBtn");

async function renderVitalTasks() {
  vitalTasksList.innerHTML = `<p style="font-size:5rem; margin-top:5rem; text-align:center">Loading...</p>`;

  try {
    if (allTasks.length === 0) {
      await refreshTasks();
    }

    const tasks = allTasks;
    const now = Date.now();
    const oneDayLater = now + 24 * 60 * 60 * 1000;

    const vitalTasks = tasks.filter((task) => {
      if (task.completed) return false;

      const isExtreme = task.priority === "extreme";
      const dueTime = task.due_date ? Number(task.due_date) : null;
      const isDueSoon = dueTime && dueTime >= now && dueTime <= oneDayLater;

      return isExtreme || isDueSoon;
    });

    if (!vitalTasks.length) {
      vitalTasksList.innerHTML =
        '<p style="font-size:3rem; margin-top:20%; text-align:center">No vital tasks at the moment.</p>';
      return;
    }

    vitalTasksList.innerHTML = "";

    vitalTasks.reverse();

    vitalTasks.forEach((task) => {
      vitalTasksList.insertAdjacentHTML("afterbegin", createTaskCard(task));
    });
  } catch (err) {
    console.error("Failed to load vital tasks:", err);
    showToast("Error loading vital tasks.", "error");
  }
}

function hideAllSections() {
  dashboardSection.style.display = "none";
  tasksSection.style.display = "none";
  vitalTasksSection.style.display = "none";
}

document.getElementById("dashboard-link").addEventListener("click", () => {
  hideAllSections();
  dashboardSection.style.display = "block";
});
document.getElementById("tasks-link").addEventListener("click", () => {
  hideAllSections();
  tasksSection.style.display = "block";
  renderAllTasks();
});
vitalTasksNav.addEventListener("click", async () => {
  hideAllSections();
  vitalTasksSection.style.display = "block";
  await renderVitalTasks();
});

seeAllTasks?.addEventListener("click", () => {
  hideAllSections();
  tasksSection.style.display = "block";
});

vitalTasksList.addEventListener("click", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;

  const descShort = card.querySelector(".desc-short");
  const descFull = card.querySelector(".desc-full");
  const showMore = card.querySelector(".show-more");

  if (!descShort || !descFull || !showMore) return;

  const isExpanded = descFull.style.display === "inline";
  descFull.style.display = isExpanded ? "none" : "inline";
  descShort.style.display = isExpanded ? "inline" : "none";

  showMore.textContent = isExpanded ? "...show more" : "...show less";
});
