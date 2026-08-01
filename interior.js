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
        <img src="${root}assets/images/logoWhite.svg" alt="" width="535" height="126">
      </a>
      <div class="interior-header-status"><i></i> Available for the right project</div>
      <nav aria-label="Main navigation">
        <a class="nav-roll" href="${root}work.html"><span class="nav-roll-primary">Work</span><span class="nav-roll-secondary" aria-hidden="true">Work</span></a>
        <a class="nav-roll" href="${root}blog.html"><span class="nav-roll-primary">Writing</span><span class="nav-roll-secondary" aria-hidden="true">Writing</span></a>
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

    const trail = document.createElement("canvas")
    trail.className = "interior-cursor-trail"
    trail.setAttribute("aria-hidden", "true")
    document.body.append(trail)

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
            <span>Have an idea worth making real?</span>
            <span>Available / 2026</span>
          </div>
          <a class="interior-footer-heading" href="mailto:rodrigodelascio@gmail.com">
            <span>LET’S MAKE</span><strong>SOMETHING</strong><i>↗</i>
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
      gsap.set(secondSplit.chars, { yPercent: 145 })
      gsap.set(second, { visibility: "visible" })

      link.addEventListener("pointerenter", () => {
        gsap.to(firstSplit.chars, {
          yPercent: -145,
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
          yPercent: 145,
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

  function initialiseFooterMotion() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return
    gsap.registerPlugin(ScrollTrigger)

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const footerHeading = document.querySelector(".interior-footer-heading")
    if (footerHeading && !footerHeading.dataset.animated) {
      footerHeading.dataset.animated = "true"
      gsap.from(
        footerHeading.querySelectorAll("span, strong"),
        {
          xPercent: index => index ? 18 : -18,
          opacity: 0,
          duration: 1.2,
          stagger: .1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".footer-section",
            start: "top 55%",
            once: true
          }
        }
      )
    }

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

  function initialiseCursorTrail() {
    if (
      !window.matchMedia("(pointer: fine) and (min-width: 901px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return

    const canvas = document.querySelector(".interior-cursor-trail")
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const points = []
    const lifetime = 520
    const coral = [255, 92, 53]
    const paper = [238, 234, 225]
    const trailColour = [...coral]
    let trailTarget = coral
    let lastPoint
    let frame

    const isCoralSurface = (x, y) => {
      const visited = new Set()
      for (const element of document.elementsFromPoint(x, y)) {
        let node = element
        while (node && node !== document.documentElement) {
          if (visited.has(node)) break
          visited.add(node)
          if (node.dataset?.cursorContrast === "paper") return true
          const match = getComputedStyle(node).backgroundColor.match(
            /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/
          )
          if (match) {
            const alpha = match[4] === undefined ? 1 : Number(match[4])
            if (alpha > .08) {
              const distance = Math.hypot(
                Number(match[1]) - coral[0],
                Number(match[2]) - coral[1],
                Number(match[3]) - coral[2]
              )
              return distance < 45
            }
          }
          node = node.parentElement
        }
      }
      return false
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * ratio)
      canvas.height = Math.round(window.innerHeight * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = time => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      while (points.length && time - points[0].time > lifetime) points.shift()
      context.lineCap = "round"
      context.lineJoin = "round"
      trailColour.forEach((value, index) => {
        trailColour[index] += (trailTarget[index] - value) * .14
      })
      const colour = trailColour.map(value => Math.round(value)).join(", ")

      for (let index = 1; index < points.length; index += 1) {
        const point = points[index]
        const previous = points[index - 1]
        const life = Math.max(0, 1 - (time - point.time) / lifetime)
        context.beginPath()
        context.moveTo(previous.x, previous.y)
        context.lineTo(point.x, point.y)
        context.strokeStyle = `rgba(${colour}, ${life * .64})`
        context.lineWidth = .5 + life * 1.7
        context.stroke()
      }

      frame = requestAnimationFrame(draw)
    }

    window.addEventListener("pointermove", event => {
      const onCoral = isCoralSurface(event.clientX, event.clientY)
      trailTarget = onCoral ? paper : coral
      document.body.classList.toggle("cursor-on-coral", onCoral)

      const nextPoint = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      }

      if (lastPoint) {
        const distance = Math.hypot(
          nextPoint.x - lastPoint.x,
          nextPoint.y - lastPoint.y
        )
        const steps = Math.min(5, Math.floor(distance / 12))
        for (let step = 1; step <= steps; step += 1) {
          const progress = step / (steps + 1)
          points.push({
            x: lastPoint.x + (nextPoint.x - lastPoint.x) * progress,
            y: lastPoint.y + (nextPoint.y - lastPoint.y) * progress,
            time: nextPoint.time
          })
        }
      }

      points.push(nextPoint)
      if (points.length > 70) points.splice(0, points.length - 70)
      lastPoint = nextPoint
    }, { passive: true })

    document.addEventListener("mouseleave", () => {
      lastPoint = undefined
      trailTarget = coral
      document.body.classList.remove("cursor-on-coral")
    })
    window.addEventListener("resize", resize)
    window.addEventListener("pagehide", () => cancelAnimationFrame(frame), {
      once: true
    })

    resize()
    frame = requestAnimationFrame(draw)
  }

  function initialiseMagneticFooter() {
    if (
      typeof gsap === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return

    const heading = document.querySelector(".interior-footer-heading")
    if (!heading) return

    heading.addEventListener("pointermove", event => {
      const bounds = heading.getBoundingClientRect()
      gsap.to(heading, {
        x: (event.clientX - bounds.left - bounds.width / 2) * .12,
        y: (event.clientY - bounds.top - bounds.height / 2) * .12,
        duration: .35
      })
    })

    heading.addEventListener("pointerleave", () => {
      gsap.to(heading, {
        x: 0,
        y: 0,
        duration: .7,
        ease: "elastic.out(1,.35)"
      })
    })
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildChrome()
    cleanVisibleText()
    initialiseHud()
    initialiseCursorTrail()
    initialiseMagneticFooter()
    initialiseNavHovers()
    initialiseFooterMotion()

    const dynamicTargets = document.querySelectorAll(".blog-container, .post-container")
    dynamicTargets.forEach(target => {
      const observer = new MutationObserver(() => {
        cleanVisibleText(target)
      })
      observer.observe(target, { childList: true, subtree: true })
    })
  })
})()
