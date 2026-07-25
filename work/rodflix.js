(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function initialiseEntry() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    const desktop = window.matchMedia("(min-width: 901px)").matches
    const title = new SplitText(".rf-hero-copy h1", { type: "chars" })
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(".rf-entry", { display: "none" })
        initialiseScrollMotion()
      }
    })

    gsap.set(".rf-entry", { display: "block" })
    gsap.set(".rf-entry i", { yPercent: 0 })
    gsap.set(title.chars, { yPercent: 115, opacity: 0 })
    gsap.set(".rf-kicker, .rf-hero-intro, .rf-hero-actions, .rf-hero-meta, .rf-scroll-cue", {
      y: 24,
      opacity: 0
    })
    gsap.set(".rf-hero-screen", {
      clipPath: "inset(50% 50% 50% 50%)",
      scale: 0.92,
      rotateY: desktop ? -8 : 0
    })

    timeline
      .to(".rf-entry span", {
        opacity: 0,
        scale: 0.82,
        duration: 0.24,
        ease: "power2.in"
      }, "+=0.2")
      .to(".rf-entry i", {
        yPercent: index => index % 2 ? 105 : -105,
        duration: 1.05,
        stagger: {
          each: 0.08,
          from: "edges"
        },
        ease: "power4.inOut"
      })
      .to(".rf-hero-screen", {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        rotateY: desktop ? -4 : 0,
        duration: 1.15,
        ease: "power4.inOut"
      }, "-=0.88")
      .to(".rf-scan-line", {
        top: "102%",
        opacity: 0.82,
        duration: 0.8,
        ease: "power2.inOut"
      }, "-=0.62")
      .to(".rf-scan-line", {
        opacity: 0,
        duration: 0.18
      })
      .to(title.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.78,
        stagger: 0.025,
        ease: "power4.out"
      }, "-=0.72")
      .to(".rf-kicker, .rf-hero-intro, .rf-hero-actions, .rf-hero-meta, .rf-scroll-cue", {
        y: 0,
        opacity: 1,
        duration: 0.62,
        stagger: 0.06,
        ease: "power3.out"
      }, "-=0.5")
  }

  function initialiseGallery() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) return

    const figures = Array.from(document.querySelectorAll(".rf-gallery-stage figure"))
    const notes = Array.from(document.querySelectorAll(".rf-gallery-notes article"))
    const counter = document.querySelector("#rf-gallery-current")
    let activeIndex = 0

    const activate = index => {
      if (index === activeIndex && figures[index]?.classList.contains("is-active")) return

      const previous = figures[activeIndex]
      const next = figures[index]

      figures.forEach((figure, figureIndex) => {
        if (figureIndex !== activeIndex && figureIndex !== index) {
          figure.classList.remove("is-active")
        }
      })
      notes.forEach((note, noteIndex) => {
        note.classList.toggle("is-active", noteIndex === index)
      })

      if (previous && previous !== next) {
        previous.classList.add("is-active")
        gsap.to(previous, {
          opacity: 0,
          scale: 0.97,
          duration: 0.42,
          ease: "power2.out",
          onComplete: () => previous.classList.remove("is-active")
        })
      }

      if (next) {
        next.classList.add("is-active")
        gsap.fromTo(
          next,
          { opacity: 0, scale: 1.055 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.72,
            ease: "power3.out"
          }
        )
      }

      activeIndex = index
      if (counter) counter.textContent = String(index + 1).padStart(2, "0")
    }

    notes.forEach((note, index) => {
      ScrollTrigger.create({
        trigger: note,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => activate(index),
        onEnterBack: () => activate(index)
      })
    })
  }

  function initialiseScrollMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    gsap.registerPlugin(ScrollTrigger, SplitText)

    gsap.to(".rf-hero-screen", {
      yPercent: 14,
      scale: 1.06,
      rotateY: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".rf-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    })

    gsap.to(".rf-hero-copy", {
      yPercent: -10,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: ".rf-hero",
        start: "25% top",
        end: "bottom top",
        scrub: 1
      }
    })

    const briefHeading = new SplitText(".rf-brief-heading h2", { type: "lines" })
    gsap.from(briefHeading.lines, {
      yPercent: 110,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".rf-brief-heading",
        start: "top 76%"
      }
    })

    gsap.from(".rf-brief-copy > *, .rf-brief-stats div", {
      y: 45,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".rf-brief-copy",
        start: "top 72%"
      }
    })

    gsap.fromTo(
      ".rf-evidence figure",
      { scale: 0.74, rotate: -6 },
      {
        scale: 1.08,
        rotate: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".rf-evidence",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    )

    gsap.from(".rf-stack-card", {
      y: 90,
      opacity: 0,
      rotate: index => index % 2 ? 3 : -3,
      duration: 0.9,
      stagger: 0.12,
      ease: "power4.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: ".rf-stack-board",
        start: "top 72%"
      }
    })

    const media = gsap.matchMedia()

    media.add("(min-width: 901px)", () => {
      const track = document.querySelector(".rf-feature-track")
      const viewport = document.querySelector(".rf-feature-viewport")
      if (!track || !viewport) return

      const horizontalDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.08)

      const tween = gsap.to(track, {
        x: () => -horizontalDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: viewport,
          start: "top 12%",
          end: () => `+=${horizontalDistance() + window.innerWidth * 0.35}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    document.querySelectorAll(".rf-conflict-list > article").forEach(article => {
      const solution = article.querySelector(".rf-conflict-solution")
      gsap.set(solution, { clipPath: "inset(0 100% 0 0)" })
      gsap.to(solution, {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: {
          trigger: article,
          start: "top 72%",
          end: "center 42%",
          scrub: 1
        }
      })
    })

    gsap.from(".rf-learning-copy > p", {
      y: 45,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".rf-learning-copy",
        start: "top 72%"
      }
    })

    gsap.from(".rf-learning-copy li", {
      x: 70,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".rf-learning-copy ol",
        start: "top 78%"
      }
    })

    const outro = new SplitText(".rf-outro h2", { type: "lines" })
    gsap.from(outro.lines, {
      yPercent: 110,
      opacity: 0,
      duration: 0.95,
      stagger: 0.12,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".rf-outro",
        start: "top 68%"
      }
    })

    initialiseGallery()
    ScrollTrigger.refresh()
  }

  window.addEventListener("load", () => {
    if (
      typeof gsap !== "undefined" &&
      typeof ScrollTrigger !== "undefined" &&
      typeof SplitText !== "undefined"
    ) {
      gsap.registerPlugin(ScrollTrigger, SplitText)
    }

    if (reduceMotion) return
    initialiseEntry()
  })
})()
