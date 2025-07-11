window.addEventListener("load", () => {
  const track = document.querySelector(".gallery-track.js-gallery");
  const group = track.querySelector(".gallery-group");

  // Calculate the width of one group
  const width = group.getBoundingClientRect().width;

  // Set the CSS custom property
  track.style.setProperty("--groupWidth", `${width}px`);

  // Add a small delay to ensure everything is loaded
  setTimeout(() => {
    track.classList.add("js-ready");
  }, 100);
});

// Optional: Handle window resize to recalculate width
window.addEventListener("resize", () => {
  const track = document.querySelector(".gallery-track.js-gallery");
  const group = track.querySelector(".gallery-group");

  if (track && group) {
    const width = group.getBoundingClientRect().width;
    track.style.setProperty("--groupWidth", `${width}px`);
  }
});
