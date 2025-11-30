const switches = document.querySelectorAll(".switch-bulb");
const btnNav = document.querySelector(".btn__mobile-nav");
const overlay = document.querySelector(".overlay");
const footerYearEl = document.querySelector(".footer-year");

document.addEventListener("DOMContentLoaded", () => {
  if (switches.length) {
    const savedMode = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", savedMode);

    switches.forEach((bulb) => {
      bulb.checked = savedMode;
    });

    switches.forEach((switchEl) => {
      switchEl.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        document.body.classList.toggle("dark-mode", isChecked);
        switches.forEach((bulb) => {
          bulb.checked = isChecked;
        });
        localStorage.setItem("darkMode", isChecked);
      });
    });
  }

  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
});

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
