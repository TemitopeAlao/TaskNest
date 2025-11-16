const btnNav = document.querySelector(".btn__mobile-nav");
const overlay = document.querySelector(".overlay");

if (btnNav) {
  btnNav.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const switchModes = document.querySelectorAll(".switch-bulb");
  if (!switchModes.length) return;

  switchModes.forEach((switchMode) => {
    switchMode.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      document.body.classList.toggle("dark-mode", isChecked);

      switchModes.forEach((bulb) => {
        bulb.checked = isChecked;
      });
    });
  });
});
