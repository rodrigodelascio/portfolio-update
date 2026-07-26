(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function initialiseSkills() {
    const tabs = Array.from(document.querySelectorAll(".skill-tab"))
    const panels = Array.from(document.querySelectorAll(".skill-panel"))

    const selectTab = tab => {
      const target = tab.dataset.skillTarget

      tabs.forEach(item => {
        const active = item === tab
        item.classList.toggle("is-active", active)
        item.setAttribute("aria-selected", String(active))
      })

      panels.forEach(panel => {
        const active = panel.dataset.skillPanel === target
        panel.hidden = !active
        panel.classList.toggle("is-active", active)

        if (
          active &&
          !reduceMotion &&
          typeof gsap !== "undefined"
        ) {
          gsap.fromTo(
            panel.querySelectorAll("span"),
            { y: 20, opacity: 0, rotate: -2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.45,
              stagger: 0.035,
              ease: "power3.out"
            }
          )
        }
      })
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab))
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return
        event.preventDefault()
        const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1
        const next = tabs[(index + direction + tabs.length) % tabs.length]
        next.focus()
        selectTab(next)
      })
    })
  }

  function initialiseAboutMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    gsap.registerPlugin(ScrollTrigger, SplitText)

    const entry = gsap.timeline()
    gsap.set(".about-entry", { display: "block", opacity: 1 })
    gsap.set(".about-entry-shutters i", { yPercent: 0 })
    gsap.set(".about-entry-index", { y: 20, opacity: 0 })
    gsap.set(".about-title-line:first-child", {
      x: -48,
      clipPath: "inset(0 100% 0 0)"
    })
    gsap.set(".about-title-line:last-child", {
      x: 48,
      clipPath: "inset(0 0 0 100%)"
    })
    gsap.set(".about-hero-meta, .about-eyebrow, .about-hero-intro, .about-scroll-cue", {
      y: 18,
      opacity: 0
    })
    gsap.set(".portrait-nail, .portrait-cords", { opacity: 0 })
    gsap.set(".about-portrait-frame", {
      clipPath: "inset(8% 48% 8% 48%)",
      scale: 0.94,
      rotate: 1.5
    })
    gsap.set(".portrait-main", { scale: 1.12 })
    gsap.set(".portrait-ghost-coral", { x: -28, opacity: 0 })
    gsap.set(".portrait-ghost-acid", { x: 28, opacity: 0 })

    entry
      .to(".about-entry-index", {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out"
      })
      .to(".about-entry-index", {
        y: -15,
        opacity: 0,
        duration: 0.35,
        delay: 0.15
      })
      .to(".about-entry-shutters i", {
        yPercent: index => index % 2 ? 105 : -105,
        duration: 1.15,
        stagger: {
          each: 0.075,
          from: "center"
        },
        ease: "power4.inOut"
      })
      .to(".about-portrait-frame", {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        rotate: 0,
        duration: 1.15,
        ease: "power4.inOut"
      }, "-=1.02")
      .to(".portrait-nail, .portrait-cords", {
        opacity: 1,
        duration: 0.45,
        ease: "power2.out"
      }, "-=0.82")
      .to(".portrait-main", {
        scale: 1,
        duration: 1.15,
        ease: "power3.out"
      }, "<")
      .to(".portrait-ghost-coral, .portrait-ghost-acid", {
        x: 0,
        opacity: 0.62,
        duration: 0.28,
        ease: "power2.out"
      }, "-=0.82")
      .to(".portrait-ghost-coral, .portrait-ghost-acid", {
        x: index => index ? 12 : -12,
        opacity: 0,
        duration: 0.42,
        ease: "power2.out"
      })
      .to(".about-title-line:first-child", {
        x: 0,
        clipPath: "inset(0 0% 0 0)",
        duration: 0.85,
        ease: "power4.out"
      }, "-=0.72")
      .to(".about-title-line:last-child", {
        x: 0,
        clipPath: "inset(0 0 0 0%)",
        duration: 0.85,
        ease: "power4.out"
      }, "-=0.66")
      .to(".about-hero-meta, .about-eyebrow, .about-hero-intro, .about-scroll-cue", {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.07,
        ease: "power3.out"
      }, "-=0.55")
      .set(".about-entry", { display: "none" })

    gsap.to(".about-portrait-frame .portrait-main", {
      yPercent: 8,
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    })

    const humanLead = new SplitText(".about-human-lead", { type: "words" })
    gsap.from(humanLead.words, {
      color: "rgba(8, 9, 11, 0.15)",
      stagger: 0.035,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-human-lead",
        start: "top 75%",
        end: "bottom 45%",
        scrub: 1
      }
    })

    gsap.to(".route-progress i", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".route-steps",
        start: "top 55%",
        end: "bottom 70%",
        scrub: 1
      }
    })

    document.querySelectorAll(".route-card").forEach((card, index) => {
      gsap.from(card, {
        x: index % 2 ? 70 : -30,
        y: 70,
        rotate: index % 2 ? 1.5 : -1,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 86%",
          once: true
        }
      })
    })

    document.querySelectorAll(".fact-card").forEach((card, index) => {
      gsap.from(card, {
        y: 90,
        rotate: index % 2 ? 2 : -2,
        opacity: 0,
        duration: 0.9,
        delay: (index % 3) * 0.08,
        ease: "back.out(1.25)",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          once: true
        }
      })
    })

    const quoteTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-final",
        start: "top 90%",
        once: true
      }
    })
    quoteTimeline
      .from(".about-final-heading span", {
        y: 18,
        opacity: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: "power3.out"
      })
      .from(".about-final-mark-open", {
        x: -60,
        rotate: -18,
        scale: 0.55,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.5)"
      }, "-=0.18")
      .from(".about-final-quote", {
        clipPath: "inset(0 0 100% 0)",
        y: 70,
        rotate: 1.2,
        opacity: 0,
        duration: 0.72,
        ease: "power4.out"
      }, "-=0.38")
      .from(".about-final-mark-close", {
        x: 50,
        y: 25,
        rotate: 20,
        scale: 0.5,
        opacity: 0,
        duration: 0.48,
        ease: "back.out(1.7)"
      }, "-=0.34")
      .from(".about-final-meta span", {
        y: 16,
        opacity: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: "power3.out"
      }, "-=0.24")

    gsap.to(".about-final-quote-wrap", {
      yPercent: -5,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-final",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    })

    ScrollTrigger.refresh()
  }

  function initialisePortraitPlay() {
    const hanging = document.querySelector(".about-portrait-hanging")
    const swing = hanging?.querySelector(".portrait-swing")
    const entryOverlay = document.querySelector(".about-entry")
    const coralGhost = hanging?.querySelector(".portrait-ghost-coral")
    const acidGhost = hanging?.querySelector(".portrait-ghost-acid")
    const colourGlow = hanging?.querySelectorAll(".portrait-colour")
    const canTrackPointer = window.matchMedia("(pointer: fine)").matches

    if (!hanging || !swing || reduceMotion || typeof gsap === "undefined") return

    if (!canTrackPointer) {
      gsap.set(swing, { rotate: -0.45 })
      gsap.to(swing, {
        rotate: 0.45,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
      return
    }

    let glowFade
    let previousPointerX

    const rotateFrame = gsap.quickTo(swing, "rotation", {
      duration: 0.8,
      ease: "elastic.out(1, 0.42)"
    })

    const hideGlow = () => {
      gsap.to([coralGhost, acidGhost], {
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
        overwrite: true
      })
      gsap.to(colourGlow, {
        opacity: 0.18,
        duration: 0.7,
        ease: "power2.out",
        overwrite: true
      })
    }

    const showGlow = (offsetX, pointerDistance) => {
      if (entryOverlay && getComputedStyle(entryOverlay).display !== "none") return

      const intensity = 0.24 + Math.min(pointerDistance / 24, 1) * 0.14

      gsap.to(coralGhost, {
        x: -9 - offsetX * 5,
        opacity: intensity,
        duration: 0.18,
        ease: "power2.out",
        overwrite: true
      })
      gsap.to(acidGhost, {
        x: 9 + offsetX * 5,
        opacity: intensity,
        duration: 0.18,
        ease: "power2.out",
        overwrite: true
      })
      gsap.to(colourGlow, {
        opacity: 0.3,
        duration: 0.24,
        ease: "power2.out",
        overwrite: true
      })

      glowFade?.kill()
      glowFade = gsap.delayedCall(0.32, hideGlow)
    }

    window.addEventListener("pointermove", event => {
      const bounds = hanging.getBoundingClientRect()
      const centreX = bounds.left + bounds.width / 2
      const offsetX = Math.max(
        -1,
        Math.min(1, (event.clientX - centreX) / (window.innerWidth * 0.4))
      )
      const pointerDistance = previousPointerX === undefined
        ? 0
        : Math.abs(event.clientX - previousPointerX)

      rotateFrame(offsetX * 2.6)
      showGlow(offsetX, pointerDistance)
      previousPointerX = event.clientX
    }, { passive: true })

    const settleFrame = () => {
      glowFade?.kill()
      rotateFrame(0)
      hideGlow()
    }
    document.addEventListener("mouseleave", settleFrame)
    window.addEventListener("blur", settleFrame)
  }

  function initialiseFactDeck() {
    const deck = document.querySelector(".fact-deck")
    if (!deck) return

    let pointerId
    let startX = 0
    let startY = 0
    let startScroll = 0
    let dragging = false

    deck.addEventListener("pointerdown", event => {
      if (!window.matchMedia("(max-width: 560px)").matches) return
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      startScroll = deck.scrollLeft
      dragging = false
      deck.setPointerCapture(pointerId)
    })

    deck.addEventListener("pointermove", event => {
      if (event.pointerId !== pointerId) return
      const distanceX = event.clientX - startX
      const distanceY = event.clientY - startY

      if (!dragging && Math.abs(distanceX) > 6 && Math.abs(distanceX) > Math.abs(distanceY)) {
        dragging = true
        deck.classList.add("is-dragging")
      }

      if (dragging) {
        event.preventDefault()
        deck.scrollLeft = startScroll - distanceX
      }
    }, { passive: false })

    const finishDrag = event => {
      if (event.pointerId !== pointerId) return
      if (deck.hasPointerCapture(pointerId)) deck.releasePointerCapture(pointerId)
      pointerId = undefined
      deck.classList.remove("is-dragging")
      dragging = false
    }

    deck.addEventListener("pointerup", finishDrag)
    deck.addEventListener("pointercancel", finishDrag)

    deck.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return
      event.preventDefault()
      const direction = event.key === "ArrowRight" ? 1 : -1
      deck.scrollBy({
        left: direction * deck.clientWidth * 0.86,
        behavior: reduceMotion ? "auto" : "smooth"
      })
    })
  }

  document.addEventListener("DOMContentLoaded", () => {
    initialiseSkills()
    initialiseFactDeck()
    initialiseAboutMotion()
    initialisePortraitPlay()
  })
})()
