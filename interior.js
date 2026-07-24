(function () {
  const nested = window.location.pathname.includes("/work/")
  const root = nested ? "../" : "./"
  const path = window.location.pathname

  function pageName() {
    if (path.includes("rodflix")) return "01 / CASE STUDY"
    if (path.includes("let-it-shine")) return "02 / CASE STUDY"
    if (path.includes("post.html")) return "ARTICLE / BLOG"
    if (path.includes("work.html")) return "01 / WORK"
    if (path.includes("blog.html")) return "02 / BLOG"
    if (path.includes("about.html")) return "03 / ABOUT"
    return "ROD / DEV"
  }

  function cleanVisibleText(rootNode = document.body) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      if (!node.parentElement?.closest("script, style, pre, code")) {
        node.nodeValue = node.nodeValue.replace(/[—–;]/g, ",")
      }
      node = walker.nextNode()
    }
  }

  function buildChrome() {
    document.body.classList.add("interior-page")
    document.body.id = "top"

    const oldMenu = document.querySelector(".off-screen-menu")
    const oldNav = document.querySelector(".nav-container")

    const menu = document.createElement("div")
    menu.className = "interior-menu"
    menu.setAttribute("aria-hidden", "true")
    menu.innerHTML = `
      <div class="interior-menu-meta">Navigate / 2026</div>
      <div class="interior-menu-links">
        <a href="${root}index.html"><span>00</span>Home</a>
        <a href="${root}work.html"><span>01</span>Work</a>
        <a href="${root}blog.html"><span>02</span>Blog</a>
        <a href="${root}about.html"><span>03</span>About</a>
      </div>
      <a class="interior-menu-mail" href="mailto:rodrigodelascio@gmail.com">rodrigodelascio@gmail.com ↗</a>
    `

    const header = document.createElement("header")
    header.className = "interior-header"
    header.innerHTML = `
      <a class="interior-wordmark" href="${root}index.html" aria-label="Rodrigo De Lascio, home">
        <span>ROD</span><b>/</b><span>DEV</span>
      </a>
      <nav aria-label="Main navigation">
        <a class="nav-roll" href="${root}work.html"><span class="nav-roll-primary">Work</span><span class="nav-roll-secondary" aria-hidden="true">Work</span></a>
        <a class="nav-roll" href="${root}blog.html"><span class="nav-roll-primary">Blog</span><span class="nav-roll-secondary" aria-hidden="true">Blog</span></a>
        <a class="nav-roll" href="${root}about.html"><span class="nav-roll-primary">About</span><span class="nav-roll-secondary" aria-hidden="true">About</span></a>
      </nav>
      <a class="interior-contact nav-cta" href="mailto:rodrigodelascio@gmail.com">
        <span class="nav-cta-inner"><span class="nav-roll-primary">Let's talk</span><span class="nav-roll-secondary" aria-hidden="true">Say hello</span></span>
      </a>
      <button class="interior-menu-button" aria-label="Open menu" aria-expanded="false">
        <i></i><i></i>
      </button>
    `

    oldMenu?.remove()
    oldNav?.replaceWith(header)
    document.body.prepend(menu)

    const noise = document.createElement("div")
    noise.className = "interior-noise"
    noise.setAttribute("aria-hidden", "true")
    document.body.append(noise)

    const hud = document.createElement("div")
    hud.className = "interior-hud"
    hud.setAttribute("aria-hidden", "true")
    hud.innerHTML = `
      <span>${pageName()}</span>
      <span><b id="interior-scroll">00</b>%</span>
      <span id="interior-clock">--:--:--</span>
    `
    document.body.append(hud)

    const button = header.querySelector(".interior-menu-button")
    const toggleMenu = () => {
      const open = button.classList.toggle("active")
      menu.classList.toggle("active", open)
      menu.setAttribute("aria-hidden", String(!open))
      button.setAttribute("aria-expanded", String(open))
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu")
      document.body.style.overflow = open ? "hidden" : ""
    }
    button.addEventListener("click", toggleMenu)
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (button.classList.contains("active")) toggleMenu()
      })
    })

    const footer = document.querySelector(".footer-section")
    if (footer) {
      footer.innerHTML = `
        <div class="interior-footer">
          <div class="interior-footer-top">
            <span>Made with care, caffeine and several browser tabs</span>
            <span>Walton-on-Thames / UK</span>
          </div>
          <a class="interior-footer-heading" href="mailto:rodrigodelascio@gmail.com">
            <span>LET'S BUILD</span><strong>SOMETHING</strong><i>↗</i>
          </a>
          <div class="interior-footer-bottom">
            <span>© ${new Date().getFullYear()} Rodrigo De Lascio</span>
            <div>
              <a href="https://github.com/rodrigodelascio/" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/rodrigo-de-lascio/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            </div>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      `
    }
  }

  function addSectionNumbers() {
    const selectors = [
      ".work-section",
      ".blog-section",
      ".about-journey-section",
      ".skills-section",
      ".fun-facts-section",
      ".cta-and-quote-section",
      ".content-section"
    ]
    document.querySelectorAll(selectors.join(",")).forEach((section, index) => {
      section.dataset.sectionNumber = String(index + 1).padStart(2, "0")
    })
  }

  function initialiseNavHovers() {
    if (
      typeof gsap === "undefined" ||
      typeof SplitText === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return

    gsap.registerPlugin(SplitText)

    const animateRoll = (link, button = false) => {
      const first = link.querySelector(".nav-roll-primary")
      const second = link.querySelector(".nav-roll-secondary")
      if (!first || !second) return

      const firstSplit = new SplitText(first, { type: "chars" })
      const secondSplit = new SplitText(second, { type: "chars" })
      gsap.set(secondSplit.chars, { yPercent: 110 })
      gsap.set(second, { visibility: "visible" })

      link.addEventListener("pointerenter", () => {
        gsap.to(firstSplit.chars, {
          yPercent: -110,
          duration: button ? .55 : .4,
          stagger: button ? .045 : .025,
          ease: "power3.inOut"
        })
        gsap.to(secondSplit.chars, {
          yPercent: 0,
          duration: button ? .55 : .4,
          stagger: button ? .045 : .025,
          ease: "power3.inOut"
        })
        if (button) {
          gsap.to(".interior-header", {
            "--cta-inset": "5px",
            duration: .55,
            ease: "power3.inOut"
          })
        } else {
          gsap.to(link, {
            "--dot-position": "-1rem",
            "--dot-opacity": 1,
            duration: .4,
            ease: "power3.inOut"
          })
        }
      })

      link.addEventListener("pointerleave", () => {
        gsap.to(firstSplit.chars, {
          yPercent: 0,
          duration: button ? .55 : .4,
          stagger: .02,
          ease: "power3.inOut"
        })
        gsap.to(secondSplit.chars, {
          yPercent: 110,
          duration: button ? .55 : .4,
          stagger: .02,
          ease: "power3.inOut"
        })
        if (button) {
          gsap.to(".interior-header", {
            "--cta-inset": "0px",
            duration: .55,
            ease: "power3.inOut"
          })
        } else {
          gsap.to(link, {
            "--dot-position": "-1.4rem",
            "--dot-opacity": 0,
            duration: .4,
            ease: "power3.inOut"
          })
        }
      })
    }

    document.querySelectorAll(".interior-header nav .nav-roll").forEach(link => {
      animateRoll(link)
    })
    const cta = document.querySelector(".interior-header .nav-cta")
    if (cta) animateRoll(cta, true)
  }

  function initialiseMotion(scope = document) {
    if (typeof gsap === "undefined" || scope.dataset?.motionReady) return
    gsap.registerPlugin(ScrollTrigger, SplitText)

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    scope.dataset && (scope.dataset.motionReady = "true")

    const hero = scope.querySelector?.(
      ".projects-title-bold, .blog-title-bold, .about-title-bold"
    )
    if (hero && !hero.dataset.animated) {
      hero.dataset.animated = "true"
      const split = new SplitText(hero, { type: "chars" })
      gsap.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        stagger: .025,
        ease: "power4.out"
      })
    }

    scope.querySelectorAll?.(
      ".project-card, .journey-card, .skill-category, .fact-item, .feature-card, .post-link, .featured-post, .grid-post"
    ).forEach(card => {
      if (card.dataset.animated) return
      card.dataset.animated = "true"
      gsap.from(card, {
        y: 70,
        opacity: 0,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      })
    })

    scope.querySelectorAll?.(".content-section > h2, .skills-section > h2, .fun-facts h2").forEach(title => {
      if (title.dataset.animated) return
      title.dataset.animated = "true"
      gsap.from(title, {
        clipPath: "inset(0 100% 0 0)",
        duration: 1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: title, start: "top 84%", once: true }
      })
    })

    scope.querySelectorAll?.(".projects-title-container > .project-image, .about-image img, .post > img").forEach(image => {
      if (image.dataset.animated) return
      image.dataset.animated = "true"
      gsap.fromTo(image, { scale: 1.06 }, {
        scale: .96,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      })
    })

    ScrollTrigger.refresh()
  }

  function initialiseHud() {
    const scroll = document.getElementById("interior-scroll")
    const clock = document.getElementById("interior-clock")
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false })
    }
    tick()
    window.setInterval(tick, 1000)
    window.addEventListener("scroll", () => {
      const available = document.documentElement.scrollHeight - window.innerHeight
      const progress = available > 0 ? Math.round(window.scrollY / available * 100) : 0
      scroll.textContent = String(Math.min(100, progress)).padStart(2, "0")
    }, { passive: true })
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildChrome()
    addSectionNumbers()
    cleanVisibleText()
    initialiseHud()
    initialiseNavHovers()
    initialiseMotion(document)

    const dynamicTargets = document.querySelectorAll(".blog-container, .post-container")
    dynamicTargets.forEach(target => {
      const observer = new MutationObserver(() => {
        cleanVisibleText(target)
        initialiseMotion(target)
      })
      observer.observe(target, { childList: true, subtree: true })
    })
  })
})()
