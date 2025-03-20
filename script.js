const hamburgerMenu = document.querySelector(".hamburger-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");
const activePage = window.location.pathname;

const navLinks = document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("nav-active");
  }
});

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});

window.addEventListener("resize", (e) => {
  if (window.matchMedia(`(min-width: 900px)`).matches) {
    hamburgerMenu.classList.remove("active");
    offScreenMenu.classList.remove("active");
  }
});
