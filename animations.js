(function () {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  function initSmoother() {
    if (reduceMotion) return null;
    return ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.15,
      effects: true,
      normalizeScroll: false
    });
  }

  function intro() {
    if (reduceMotion) return;
    const title = new SplitText(".hero-title", { type: "chars" });
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    gsap.set(title.chars, { yPercent: 115, opacity: 0 });
    gsap.set(".hero-portrait-shell", { xPercent: -50, y: 40, opacity: 0 });
    tl.to(title.chars, { yPercent: 0, opacity: 1, duration: 1.25, stagger: .018 })
      .to(".hero-portrait-shell", { y: 0, opacity: 1, duration: 1.25 }, "-=.9")
      .from(".hero-kicker, .hero-bottom", { y: 24, opacity: 0, duration: .8, stagger: .15 }, "-=.65");
  }

  function heroMotion() {
    if (reduceMotion) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .7 }
    });
    tl.to(".hero-line-one", { xPercent: -12, opacity: .1, ease: "none" }, 0)
      .to(".hero-line-two", { xPercent: 12, opacity: .12, ease: "none" }, 0)
      .to(".hero-portrait-shell", { yPercent: 10, opacity: .15, ease: "none" }, 0)
      .to(".hero-bottom", { opacity: 0, y: -40, ease: "none" }, 0)
      .to(".hero-kicker", { opacity: 0, ease: "none" }, 0);
  }

  function sectionReveals() {
    if (reduceMotion) return;
    document.querySelectorAll(".section-heading").forEach((heading) => {
      gsap.from(heading.querySelectorAll(".section-index, h2 span, h2 strong"), {
        yPercent: 70,
        opacity: 0,
        duration: 1,
        stagger: .1,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 78%", once: true }
      });
    });

    const manifesto = new SplitText(".manifesto-copy", { type: "words,chars", wordsClass: "word" });
    gsap.fromTo(manifesto.chars, {
      color: "rgba(8, 9, 11, 0.14)"
    }, {
      color: (index, character) => character.closest("em") ? "#ff5c35" : "#08090b",
      stagger: .018,
      ease: "none",
      scrollTrigger: {
        trigger: ".manifesto",
        start: "top top",
        end: "+=110%",
        pin: true,
        anticipatePin: 1,
        scrub: 1.2
      }
    });

    document.querySelectorAll(".project").forEach((project) => {
      const image = project.querySelector(".project-image");
      gsap.from(image, {
        yPercent: 24,
        rotate: -8,
        scale: .88,
        scrollTrigger: { trigger: project, start: "top 85%", end: "center 55%", scrub: .6 }
      });
      gsap.from(project.querySelectorAll(".project-copy > *"), {
        y: 40,
        opacity: 0,
        stagger: .08,
        duration: .85,
        ease: "power3.out",
        scrollTrigger: { trigger: project, start: "top 68%", once: true }
      });
    });

    if (window.matchMedia("(min-width: 901px)").matches) {
      const projectList = document.querySelector(".project-list");
      const projectRail = document.querySelector(".project-rail");
      const projectTravel = () => Math.max(0, projectList.scrollWidth - document.documentElement.clientWidth + window.innerWidth * .05);
      gsap.to(projectList, {
        x: () => -projectTravel(),
        ease: "none",
        scrollTrigger: {
          trigger: projectRail,
          start: "top 12%",
          end: () => `+=${projectTravel()}`,
          pin: projectRail,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    gsap.to(".interlude-track", {
      xPercent: -36,
      ease: "none",
      scrollTrigger: { trigger: ".interlude", start: "top bottom", end: "bottom top", scrub: 1 }
    });

    gsap.from(".article-card", {
      y: 90,
      opacity: 0,
      stagger: .12,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".article-grid", start: "top 78%", once: true }
    });

    gsap.from(".contact-heading span, .contact-heading strong", {
      xPercent: (i) => i ? 18 : -18,
      opacity: 0,
      duration: 1.2,
      stagger: .1,
      ease: "power4.out",
      scrollTrigger: { trigger: ".contact", start: "top 55%", once: true }
    });
  }

  function hud() {
    const progress = document.getElementById("hud-scroll-value");
    const cardProgress = document.getElementById("hud-card-scroll-value");
    const section = document.getElementById("hud-section-value");
    const clock = document.getElementById("hud-clock-value");
    const tick = () => {
      if (clock) clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    };
    tick();
    window.setInterval(tick, 1000);
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: self => {
        const value = String(Math.round(self.progress * 100)).padStart(2, "0");
        if (progress) progress.textContent = value;
        if (cardProgress) cardProgress.textContent = value;
      }
    });
    document.querySelectorAll("[data-section]").forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 58%",
        end: "bottom 58%",
        onToggle: self => { if (self.isActive && section) section.textContent = el.dataset.section; }
      });
    });
  }

  function magnetic() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .12, y: (e.clientY - r.top - r.height / 2) * .12, duration: .35 });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: "elastic.out(1,.35)" }));
    });
  }

  window.addEventListener("load", () => {
    initSmoother();
    intro();
    heroMotion();
    sectionReveals();
    hud();
    magnetic();
    ScrollTrigger.refresh();
  });
})();
