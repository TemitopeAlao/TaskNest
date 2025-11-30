import { showToast, setLoading } from "./auth.js";
import { addTask } from "./task.js";

const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:IzI935XO";

export const getAllTasks = async function () {
  const token = localStorage.getItem("userToken");
  const userId = Number(localStorage.getItem("userId"));

  if (!token || !userId) return [];

  try {
    const res = await fetch(`${API_BASE}/todo`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch tasks");

    const data = await res.json();
    return data ? data.filter((task) => task.user_id === userId) : [];
  } catch (err) {
    console.error("getAllTasks error:", err);
    return [];
  }
};

export let allTasks = [];

export async function refreshTasks() {
  try {
    const res = await getAllTasks();

    allTasks = res.map((t) => ({
      ...t,
      status: t.completed ? "Completed" : "In Progress",
    }));

    return allTasks;
  } catch (err) {
    console.error("Failed to fetch tasks", err);
    allTasks = [];
    return [];
  }
}
export const createTask = async (taskData) => {
  const token = localStorage.getItem("userToken");
  const userId = Number(localStorage.getItem("userId"));

  if (!token || !userId) {
    showToast("User not logged in.", "error");
    return null;
  }
  const doneBtn = document.querySelector(".done-btn");
  setLoading(doneBtn, true);

  try {
    const payload = { ...taskData, user_id: userId };
    const res = await fetch(`${API_BASE}/todo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Task created successfully!");
      addTask(data);
      return data;
    } else {
      showToast(data.message || "Failed to create task.", "error");
      return null;
    }
  } catch (err) {
    console.error("createTask error:", err);
    showToast("Failed to create task.", "error");
    return null;
  } finally {
    setLoading(doneBtn, false);
  }
};

export const updateTaskCompleted = async (id, completed) => {
  const token = localStorage.getItem("userToken");
  if (!token) return null;

  try {
    const current = await fetch(`${API_BASE}/todo/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const currentTask = await current.json();

    const payload = {
      ...currentTask,
      completed,
      updated_at: Date.now(),
    };

    const res = await fetch(`${API_BASE}/todo/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update task");

    return await res.json();
  } catch (err) {
    console.error("updateTaskCompleted error:", err);
    showToast("Failed to update task", "error");
    return null;
  }
};

export const updateTaskBackend = async (id, updatedData) => {
  const token = localStorage.getItem("userToken");
  const userId = Number(localStorage.getItem("userId"));

  if (!token || !userId) return null;
  const doneBtn = document.querySelector(".done-btn");
  setLoading(doneBtn, true);

  try {
    const current = await fetch(`${API_BASE}/todo/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    const payload = {
      ...current,
      ...updatedData,
      updated_at: Date.now(),
    };

    const res = await fetch(`${API_BASE}/todo/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update task");

    return await res.json();
  } catch (err) {
    console.error("updateTaskBackend error:", err);
    showToast("Failed to update task", "error");
    return null;
  } finally {
    setLoading(doneBtn, false);
  }
};

export const deleteTask = async (id) => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    showToast("User not logged in.", "error");
    return false;
  }
  const deleteBtn = document.querySelector(".delete-btn");
  setLoading(deleteBtn, true);

  try {
    const res = await fetch(`${API_BASE}/todo/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      showToast("Failed to delete task", "error");
      return false;
    }

    return true;
  } catch (err) {
    console.error("deleteTask error:", err);
    showToast("Failed to delete task", "error");
    return false;
  } finally {
    setLoading(deleteBtn, false);
  }
};
