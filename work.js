(function () {
  /*
   * Add new work here. The page, numbering, filters, links, and project count
   * are generated automatically from this collection.
   */
  const projects = [
    {
      title: "RodFlix App",
      year: "2025",
      type: "Full-stack application",
      filters: ["full-stack", "api"],
      description:
        "A database-driven application for browsing, exploring, importing, and managing television series data.",
      image: "./assets/images/rodflixSeriesMockup.webp",
      imageAlt: "RodFlix series page displayed on a desktop computer",
      accent: "rodflix",
      tags: ["PHP", "JavaScript", "SQL", "TVmaze API"],
      links: [
        { label: "Live site", url: "https://rodflix.infinityfreeapp.com/", external: true },
        { label: "Source code", url: "https://github.com/rodrigodelascio/rodflix-app", external: true },
        { label: "Case study", url: "./work/rodflix.html" }
      ]
    },
    {
      title: "Let It Shine",
      year: "2025",
      type: "Client website",
      filters: ["frontend"],
      description:
        "A complete website for a local cleaning company, with a modern interface, responsive layout, and a delightfully spotless user experience.",
      image: "./assets/images/letItShineOnImac.webp",
      imageAlt: "Let It Shine website displayed on an iMac",
      accent: "shine",
      tags: ["React", "React Hooks", "React Router"],
      links: [
        { label: "Live site", url: "https://let-it-shine.co.uk/", external: true },
        { label: "Source code", url: "https://github.com/rodrigodelascio/let-it-shine", external: true },
        { label: "Case study", url: "./work/let-it-shine.html" }
      ]
    },
    {
      title: "Sunnyside",
      year: "2023",
      type: "Frontend study",
      filters: ["frontend"],
      description:
        "A playful creative-agency concept built as a responsive frontend study, with strong art direction and mobile-first behaviour.",
      image: "./assets/images/sunnysideOnMacbook.webp",
      imageAlt: "Sunnyside creative agency website displayed on a MacBook",
      accent: "sunnyside",
      tags: ["HTML", "CSS", "JavaScript"],
      links: [
        { label: "Live site", url: "https://rodrigodelascio.github.io/Sunnyside-Agency-Website/", external: true },
        { label: "Source code", url: "https://github.com/rodrigodelascio/Sunnyside-Agency-Website", external: true }
      ]
    },
    {
      title: "RodWeather",
      year: "2023",
      type: "API experiment",
      filters: ["frontend", "api"],
      description:
        "A weather application combining live forecasts, location search, city data, and contextual photography.",
      image: "./assets/images/rodweatherIpadMockup.webp",
      imageAlt: "RodWeather application displayed on an iPad",
      accent: "rodweather",
      tags: ["JavaScript", "OpenWeather API", "GeoDB API", "Unsplash API"],
      links: [
        { label: "Live site", url: "https://rodrigodelascio.github.io/RodWeather/", external: true },
        { label: "Source code", url: "https://github.com/rodrigodelascio/Rod-Weather", external: true }
      ]
    }
  ]

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const escapeHTML = value =>
    String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
    )

  function linkMarkup(link) {
    const external = link.external
      ? ' target="_blank" rel="noreferrer"'
      : ""
    return `
      <a href="${escapeHTML(link.url)}"${external}>
        <span>${escapeHTML(link.label)}</span><i>↗</i>
      </a>
    `
  }

  function projectMarkup(project, index) {
    return `
      <article
        class="work-project"
        data-project
        data-filters="${project.filters.join(" ")}"
        data-accent="${escapeHTML(project.accent)}"
      >
        <div class="work-project-number">${String(index + 1).padStart(2, "0")}</div>

        <div class="work-project-copy">
          <div class="work-project-meta">
            <span>${escapeHTML(project.type)}</span>
            <span>${escapeHTML(project.year)}</span>
          </div>
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(project.description)}</p>
          <div class="work-project-tags">
            ${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <div class="work-project-links">
            ${project.links.map(linkMarkup).join("")}
          </div>
        </div>

        <div class="work-project-media">
          <span class="work-project-media-label">PROJECT_${String(index + 1).padStart(2, "0")}</span>
          <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}">
          <i class="work-project-arrow">↗</i>
        </div>
      </article>
    `
  }

  function renderProjects() {
    document.querySelector(".work-projects").innerHTML =
      projects.map(projectMarkup).join("")
    document.querySelectorAll("[data-project-total], #visible-project-count")
      .forEach(element => {
        element.textContent = String(projects.length).padStart(2, "0")
      })
  }

  function initialiseFilters() {
    const buttons = document.querySelectorAll("[data-filter]")
    const projectElements = document.querySelectorAll("[data-project]")
    const count = document.getElementById("visible-project-count")

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter
        buttons.forEach(item => {
          item.setAttribute("aria-pressed", String(item === button))
        })

        let visible = 0
        projectElements.forEach(project => {
          const matches =
            filter === "all" ||
            project.dataset.filters.split(" ").includes(filter)
          project.hidden = !matches
          if (matches) visible += 1
        })
        count.textContent = String(visible).padStart(2, "0")

        if (!reduceMotion && typeof gsap !== "undefined") {
          gsap.fromTo(
            [...projectElements].filter(project => !project.hidden),
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.07,
              ease: "power3.out",
              clearProps: "transform,opacity"
            }
          )
        }
        window.ScrollTrigger?.refresh()
      })
    })
  }

  function initialiseHeroMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    gsap.registerPlugin(ScrollTrigger, SplitText)
    const title = new SplitText(".work-hero-copy h1", { type: "lines" })
    gsap.set(".work-hero-meta, .work-hero-copy > p, .work-scroll-cue", {
      y: 20,
      opacity: 0
    })
    gsap.set(title.lines, { yPercent: 120, opacity: 0 })
    gsap.set(".work-showreel-panel", { yPercent: 110 })
    gsap.set(".work-showreel-panel img", { scale: 1.25 })

    const initialiseHeroScroll = () => {
      gsap.to(".work-showreel", {
        xPercent: 10,
        scale: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: ".work-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      })

      document.querySelectorAll(".work-showreel-panel").forEach((panel, index) => {
        gsap.to(panel, {
          yPercent: index % 2 ? 11 : -11,
          ease: "none",
          scrollTrigger: {
            trigger: ".work-hero",
            start: "top top",
            end: "bottom top",
            scrub: 1
          }
        })
      })
      ScrollTrigger.refresh()
    }

    const entrance = gsap.timeline()
    entrance
      .from(".work-hero-wipe span", {
        y: 20,
        opacity: 0,
        duration: 0.45,
        ease: "power3.out"
      })
      .to(".work-hero-wipe span", {
        y: -15,
        opacity: 0,
        duration: 0.35,
        delay: 0.15
      })
      .to(".work-hero-wipe", {
        clipPath: "inset(0 0 0 100%)",
        duration: 1.05,
        ease: "power4.inOut"
      })
      .to(".work-showreel-panel", {
        yPercent: 0,
        duration: 1,
        stagger: 0.09,
        ease: "power4.out"
      }, "-=0.9")
      .to(".work-showreel-panel img", {
        scale: 1,
        duration: 1.2,
        stagger: 0.07,
        ease: "power3.out"
      }, "-=1")
      .to(".work-hero-meta, .work-hero-copy > p", {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.08
      }, "-=0.65")
      .to(title.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.1,
        ease: "power4.out"
      }, "-=0.35")
      .to(".work-scroll-cue", {
        y: 0,
        opacity: 1,
        duration: 0.5
      }, "-=0.25")
      .set(".work-hero-wipe", {
        display: "none"
      })
    entrance.eventCallback("onComplete", initialiseHeroScroll)

    if (window.matchMedia("(pointer: fine)").matches) {
      const moveX = gsap.quickTo(".work-showreel", "x", {
        duration: 0.8,
        ease: "power3.out"
      })
      const moveY = gsap.quickTo(".work-showreel", "y", {
        duration: 0.8,
        ease: "power3.out"
      })
      document.querySelector(".work-hero").addEventListener("pointermove", event => {
        moveX((event.clientX / window.innerWidth - 0.5) * 14)
        moveY((event.clientY / window.innerHeight - 0.5) * 14)
      })
    }
  }

  function initialiseProjectMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) return

    document.querySelectorAll(".work-project").forEach(project => {
      gsap.from(project.querySelectorAll(
        ".work-project-number, .work-project-copy > *, .work-project-media"
      ), {
        y: 45,
        opacity: 0,
        duration: 0.75,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: project,
          start: "top 82%",
          once: true
        }
      })
    })
    ScrollTrigger.refresh()
  }

  renderProjects()
  initialiseFilters()
  initialiseHeroMotion()
  initialiseProjectMotion()
})()
