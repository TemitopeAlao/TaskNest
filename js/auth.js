export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.style.background = type === "error" ? "#e74c3c" : "#2ecc71";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

export function setLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.original = button.textContent;
    button.innerHTML = `
      <span class="spinner"></span>
      <span class="loading-dots">Loading...</span>
    `;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.original;
  }
}

function showModal(message) {
  const modal = document.getElementById("successModal");
  const modalMsg = document.getElementById("modalMessage");

  modalMsg.textContent = message;
  modal.style.display = "flex";

  setTimeout(() => {
    modal.style.display = "none";
  }, 1500);
}

function validateSignupForm() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  [nameError, emailError, passwordError, confirmPasswordError].forEach(
    (el) => (el.textContent = "")
  );

  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
    (el) => (el.style.borderLeft = "none")
  );

  let valid = true;

  function markError(input, errorDiv, message) {
    errorDiv.textContent = message;
    input.style.borderLeft = "5px solid #e74c3c";
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{5,}$/;

  if (!nameInput.value.trim())
    markError(nameInput, nameError, "Full name is required.");
  if (!emailInput.value.trim()) {
    markError(emailInput, emailError, "Email is required.");
  } else if (!emailPattern.test(emailInput.value.trim())) {
    markError(emailInput, emailError, "Enter a valid email.");
  }
  if (!passwordInput.value.trim()) {
    markError(passwordInput, passwordError, "Password is required.");
  } else if (!passwordPattern.test(passwordInput.value.trim())) {
    markError(
      passwordInput,
      passwordError,
      "Password must include uppercase, number, special char and be 5+ chars."
    );
  }
  if (!confirmPasswordInput.value.trim()) {
    markError(
      confirmPasswordInput,
      confirmPasswordError,
      "Please confirm password."
    );
  } else if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
    markError(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match."
    );
  }

  return valid;
}

const authSignup = async function (e) {
  e.preventDefault();
  const signupBtn = document.querySelector(".btn-login");
  setLoading(signupBtn, true);

  const isValid = validateSignupForm();
  if (!isValid) {
    setLoading(signupBtn, false);
    return;
  }

  const name = document.querySelector(".signup-name").value;
  const email = document.querySelector(".signup-email").value;
  const password = document.querySelector(".signup-password").value;

  try {
    const res = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:o02AIwfn/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      if (data.message?.toLowerCase().includes("email")) {
        showToast("This email is already in use.", "error");
      } else {
        showToast(data.message || "Signup failed.", "error");
      }
      setLoading(signupBtn, false);
      return;
    }

    setTimeout(() => {
      showModal("Your Account has been successfully created!");
    }, 200);

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  } catch (err) {
    showToast("Network error. Try again.", "error");
  } finally {
    setLoading(signupBtn, false);
  }
};

const authLogin = async function (e) {
  e.preventDefault();

  const loginBtn = document.querySelector(".btn-login");
  const errorDiv = document.getElementById("login-error");

  errorDiv.textContent = "";
  setLoading(loginBtn, true);

  const email = document.querySelector(".login-email").value.trim();
  const password = document.querySelector(".login-password").value.trim();

  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{5,}$/;

  if (!email || !password) {
    showToast("Email and password are required.", "error");
    setLoading(loginBtn, false);
    return;
  }

  if (!passwordPattern.test(password)) {
    errorDiv.textContent =
      "Password must include uppercase, number, special character and be 5+ characters.";
    setLoading(loginBtn, false);
    return;
  }

  try {
    const res = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:o02AIwfn/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showToast("Incorrect email or password.", "error");
      setLoading(loginBtn, false);
      return;
    }

    localStorage.setItem("userToken", data.authToken);
    localStorage.setItem("userId", data.user_id);

    showToast("Login successful!");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (err) {
    showToast("Network error. Try again.", "error");
  } finally {
    setLoading(loginBtn, false);
  }
};

document.querySelector("#signup-form")?.addEventListener("submit", authSignup);
document.querySelector("#login-form")?.addEventListener("submit", authLogin);

export const getUserRecord = async () => {
  const token = localStorage.getItem("userToken");
  if (!token) return null;

  try {
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
  } catch (err) {
    console.error(err);
    return null;
  }
};
