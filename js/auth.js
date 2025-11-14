function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get input elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  // Get error message divs
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  // Reset previous errors
  [nameError, emailError, passwordError, confirmPasswordError].forEach(
    (el) => (el.textContent = "")
  );
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
    (el) => (el.style.borderLeft = "none")
  );

  let valid = true;

  // Helper to mark error
  function markError(input, errorDiv, message) {
    errorDiv.textContent = message;
    input.style.borderLeft = "5px solid #e74c3c"; // red left border only
    valid = false;
  }

  // Name validation
  if (!nameInput.value.trim()) {
    markError(nameInput, nameError, "Full name is required.");
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim()) {
    markError(emailInput, emailError, "Email is required.");
  } else if (!emailPattern.test(emailInput.value.trim())) {
    markError(emailInput, emailError, "Enter a valid email address.");
  }

  // Password validation
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{5,}$/;
  if (!passwordInput.value.trim()) {
    markError(passwordInput, passwordError, "Password is required.");
  } else if (!passwordPattern.test(passwordInput.value.trim())) {
    markError(
      passwordInput,
      passwordError,
      "Password must be 5+ chars, include 1 uppercase, 1 number & 1 special char."
    );
  }

  // Confirm password validation
  if (!confirmPasswordInput.value.trim()) {
    markError(
      confirmPasswordInput,
      confirmPasswordError,
      "Please confirm your password."
    );
  } else if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
    markError(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match."
    );
  }

  if (!valid) return;

  // Save user to sessionStorage
  const user = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
  };
  sessionStorage.setItem("user", JSON.stringify(user));

  // Show success toast and redirect
  showToast("Signup successful!");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2000);
});
