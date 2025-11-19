import { showToast } from "./auth.js";
import { addTask } from "./task.js";
export const getUserRecord = async function () {
  const token = localStorage.getItem("userToken");
  if (!token) return;

  const res = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:o02AIwfn/auth/me",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  localStorage.setItem("userData", JSON.stringify(data));

  return data;
};
export const createTodo = async function (e) {
  e.preventDefault();

  const taskData = {
    title: document.getElementById("title").value,
    date: document.getElementById("date").value,
    priority: document.querySelector('input[name="priority"]:checked')?.value,
    description: document.getElementById("description").value,
  };

  try {
    const res = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:IzI935XO/todo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      }
    );

    if (res.ok) {
      showToast("Task created successfully!");
      addTask(taskData);
      addTaskForm.style.display = "none";
      document.querySelector(".task-form").reset();
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to create task.", "error");
  }
};
