const hamburgerMenu = document.querySelector(".hamburger-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");
const activePage = window.location.pathname;

const navLinks = document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("nav-active");
  }
});

if (hamburgerMenu && offScreenMenu) {
  hamburgerMenu.addEventListener("click", () => {
    const isOpen = hamburgerMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active", isOpen);
    offScreenMenu.setAttribute("aria-hidden", String(!isOpen));
    hamburgerMenu.setAttribute("aria-expanded", String(isOpen));
    hamburgerMenu.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  offScreenMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburgerMenu.classList.remove("active");
      offScreenMenu.classList.remove("active");
      offScreenMenu.setAttribute("aria-hidden", "true");
      hamburgerMenu.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

window.addEventListener("resize", (e) => {
  if (window.matchMedia(`(min-width: 900px)`).matches) {
    hamburgerMenu?.classList.remove("active");
    offScreenMenu?.classList.remove("active");
    offScreenMenu?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
});
