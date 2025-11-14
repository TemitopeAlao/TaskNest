const btnNav = document.querySelector(".btn__mobile-nav");
const overlay = document.querySelector(".overlay");

btnNav.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

overlay.addEventListener("click", () => {
  document.body.classList.remove("nav-open");
});
