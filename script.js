const hamburgerMenu = document.querySelector(".hamburger-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

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
