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

  function roundedCardShape(width, height, radius) {
    const left = -width / 2
    const right = width / 2
    const bottom = -height / 2
    const top = height / 2
    const shape = new THREE.Shape()

    shape.moveTo(left + radius, bottom)
    shape.lineTo(right - radius, bottom)
    shape.quadraticCurveTo(right, bottom, right, bottom + radius)
    shape.lineTo(right, top - radius)
    shape.quadraticCurveTo(right, top, right - radius, top)
    shape.lineTo(left + radius, top)
    shape.quadraticCurveTo(left, top, left, top - radius)
    shape.lineTo(left, bottom + radius)
    shape.quadraticCurveTo(left, bottom, left + radius, bottom)
    shape.closePath()

    return shape
  }

  function normaliseCardUvs(geometry, width, height) {
    const positions = geometry.attributes.position
    const uvs = geometry.attributes.uv

    for (let index = 0; index < positions.count; index += 1) {
      uvs.setXY(
        index,
        (positions.getX(index) + width / 2) / width,
        (positions.getY(index) + height / 2) / height
      )
    }
    uvs.needsUpdate = true
  }

  function cropTextureToCard(texture, cardAspect) {
    const imageAspect = texture.image.width / texture.image.height
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping

    if (imageAspect > cardAspect) {
      texture.repeat.x = cardAspect / imageAspect
      texture.offset.x = (1 - texture.repeat.x) / 2
    } else {
      texture.repeat.y = imageAspect / cardAspect
      texture.offset.y = (1 - texture.repeat.y) / 2
    }
  }

  async function initialiseWebGLShowreel() {
    const host = document.querySelector(".work-showreel")
    const canvas = document.querySelector(".work-showreel-canvas")
    const fallbackStage = document.querySelector(".work-showreel-stage")
    const fallbackPanels = [...document.querySelectorAll(".work-showreel-panel")]
    const projectLinks = [...document.querySelectorAll("[data-webgl-project]")]

    if (
      !host ||
      !canvas ||
      !fallbackStage ||
      reduceMotion ||
      typeof THREE === "undefined"
    ) return

    const accentColours = [0xff8b1c, 0x008c8c, 0x3dbeff, 0x29282d]
    const layouts = [
      { x: -3.15, y: 0, z: 0.9, rx: 0, ry: 0, rz: 0 },
      { x: -1.05, y: 0.03, z: 0.3, rx: 0, ry: 0, rz: 0 },
      { x: 1.05, y: 0.03, z: -0.3, rx: 0, ry: 0, rz: 0 },
      { x: 3.15, y: 0, z: -0.9, rx: 0, ry: 0, rz: 0 }
    ]
    const cardWidth = 2.2
    const cardHeight = 3.68
    const cardAspect = cardWidth / cardHeight
    const deckFrame = {
      width: 9,
      height: 5.35,
      nearestZ: 2
    }
    const cards = []
    const hitTargets = []
    const motionState = {
      intro: 0,
      scroll: 0
    }
    const white = new THREE.Color(0xffffff)
    const dimmed = new THREE.Color(0x353638)

    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      })
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
      const deck = new THREE.Group()
      deck.position.y = 0.28
      scene.add(deck)

      scene.add(new THREE.AmbientLight(0xffffff, 1.3))

      const keyLight = new THREE.DirectionalLight(0xeeeae1, 3.2)
      keyLight.position.set(-4, 6, 9)
      scene.add(keyLight)

      const acidLight = new THREE.PointLight(0xd8ff3e, 22, 18, 2)
      acidLight.position.set(4, 1.5, 5)
      scene.add(acidLight)

      const coralLight = new THREE.PointLight(0xff5c35, 18, 16, 2)
      coralLight.position.set(-4, -2, 4)
      scene.add(coralLight)

      const loader = new THREE.TextureLoader()
      const textures = await Promise.all(
        fallbackPanels.map(panel =>
          loader.loadAsync(panel.querySelector("img").getAttribute("src"))
        )
      )

      textures.forEach((texture, index) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy()
        )
        cropTextureToCard(texture, cardAspect)

        const shape = roundedCardShape(cardWidth, cardHeight, 0.2)
        const frontGeometry = new THREE.ShapeGeometry(shape, 20)
        normaliseCardUvs(frontGeometry, cardWidth, cardHeight)

        const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.2,
          bevelEnabled: true,
          bevelSegments: 5,
          bevelSize: 0.055,
          bevelThickness: 0.055,
          curveSegments: 20,
          steps: 1
        })
        bodyGeometry.translate(0, 0, -0.23)

        const accent = new THREE.Color(accentColours[index])
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
          color: accent,
          roughness: 0.3,
          metalness: 0.12,
          clearcoat: 0.72,
          clearcoatRoughness: 0.2
        })
        const frontMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          color: white.clone(),
          toneMapped: false
        })

        const card = new THREE.Group()
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        const front = new THREE.Mesh(frontGeometry, frontMaterial)
        front.position.z = 0.055

        const outline = new THREE.LineSegments(
          new THREE.EdgesGeometry(frontGeometry, 18),
          new THREE.LineBasicMaterial({
            color: 0xeeeae1,
            transparent: true,
            opacity: 0.38
          })
        )
        outline.position.z = 0.065

        const hitArea = new THREE.Mesh(
          new THREE.PlaneGeometry(cardWidth * 1.04, cardHeight * 1.04),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            colorWrite: false,
            side: THREE.DoubleSide
          })
        )
        hitArea.position.set(
          layouts[index].x,
          layouts[index].y,
          layouts[index].z + 0.12
        )
        hitArea.userData.cardIndex = index
        hitTargets.push(hitArea)
        deck.add(hitArea)

        Array.of(body, front, outline).forEach(object => {
          object.userData.cardIndex = index
        })

        card.add(body, front, outline)
        card.position.set(
          layouts[index].x,
          layouts[index].y - 0.7,
          layouts[index].z - 4
        )
        card.rotation.set(
          layouts[index].rx + 0.18,
          layouts[index].ry,
          layouts[index].rz
        )
        card.scale.setScalar(0.72)
        card.userData = {
          index,
          base: layouts[index],
          frontMaterial,
          bodyMaterial,
          accent,
          dimAccent: accent.clone().multiplyScalar(0.24),
          phase: index * 1.35,
          reveal: 0,
          hitArea
        }
        cards.push(card)
        deck.add(card)
      })

      fallbackStage.setAttribute("aria-hidden", "true")
      fallbackPanels.forEach(panel => {
        panel.tabIndex = -1
      })
      host.classList.add("is-webgl")

      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2(3, 3)
      const baseDeckRotationX = -0.02
      const baseDeckRotationY = -0.3
      let focusedIndex = null
      let pointerRotationX = baseDeckRotationX
      let pointerRotationY = baseDeckRotationY
      let cameraBaseZ = 12
      let isVisible = true
      let lastPointerHit = 0

      const setFocusedCard = index => {
        if (focusedIndex === index) return
        focusedIndex = index
        projectLinks.forEach((link, linkIndex) => {
          link.classList.toggle("is-active", linkIndex === index)
        })
      }

      const updatePointer = event => {
        const bounds = canvas.getBoundingClientRect()
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        pointerRotationY = baseDeckRotationY + pointer.x * 0.06
        pointerRotationX = baseDeckRotationX + pointer.y * -0.04
        raycaster.setFromCamera(pointer, camera)
        const match = raycaster.intersectObjects(hitTargets, false)[0]
        if (match) {
          lastPointerHit = performance.now()
          setFocusedCard(match.object.userData.cardIndex)
        } else if (performance.now() - lastPointerHit > 110) {
          setFocusedCard(null)
        }
      }

      canvas.addEventListener("pointermove", updatePointer)
      canvas.addEventListener("pointerdown", updatePointer)
      canvas.addEventListener("pointerleave", () => {
        pointerRotationX = baseDeckRotationX
        pointerRotationY = baseDeckRotationY
        lastPointerHit = 0
        setFocusedCard(null)
      })
      canvas.addEventListener("click", () => {
        if (focusedIndex === null) return
        const link = projectLinks[focusedIndex]
        if (link.target === "_blank") {
          window.open(link.href, "_blank", "noopener,noreferrer")
        } else {
          window.location.href = link.href
        }
      })

      projectLinks.forEach((link, index) => {
        link.addEventListener("pointerenter", () => setFocusedCard(index))
        link.addEventListener("focus", () => setFocusedCard(index))
        link.addEventListener("pointerleave", () => setFocusedCard(null))
        link.addEventListener("blur", () => setFocusedCard(null))
      })

      const resize = () => {
        const bounds = host.getBoundingClientRect()
        if (!bounds.width || !bounds.height) return

        const responsiveSpacing =
          window.innerWidth <= 700
            ? 2.3
            : window.innerWidth <= 1000
              ? 2.24
              : 2.1

        cards.forEach((card, index) => {
          card.userData.base.x = (index - 1.5) * responsiveSpacing
        })
        deckFrame.width = Math.max(
          9,
          responsiveSpacing * 3 + cardWidth + 0.25
        )

        renderer.setSize(bounds.width, bounds.height, false)
        camera.aspect = bounds.width / bounds.height

        const verticalFov = THREE.MathUtils.degToRad(camera.fov)
        const horizontalFov =
          2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
        const distanceForHeight =
          deckFrame.height / (2 * Math.tan(verticalFov / 2))
        const distanceForWidth =
          deckFrame.width / (2 * Math.tan(horizontalFov / 2))

        cameraBaseZ =
          Math.max(distanceForHeight, distanceForWidth) +
          deckFrame.nearestZ +
          0.35
        camera.position.set(
          0,
          0.18,
          cameraBaseZ + (focusedIndex === null ? 0 : 0.85)
        )
        camera.updateProjectionMatrix()
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      resize()

      const visibilityObserver = new IntersectionObserver(entries => {
        isVisible = entries[0]?.isIntersecting ?? true
      })
      visibilityObserver.observe(host)

      let previousTime = performance.now()
      const animate = time => {
        requestAnimationFrame(animate)
        if (!isVisible || document.hidden) {
          previousTime = time
          return
        }

        const delta = Math.min((time - previousTime) / 1000, 0.05)
        previousTime = time
        const smoothing = 1 - Math.exp(-delta * 7.5)
        const colourSmoothing = 1 - Math.exp(-delta * 5.5)
        const intro = motionState.intro
        const scroll = motionState.scroll
        const targetCameraZ =
          cameraBaseZ +
          (1 - intro) * 2.2 +
          (focusedIndex === null ? 0 : 0.85) -
          scroll * 0.8

        camera.position.z = THREE.MathUtils.lerp(
          camera.position.z,
          targetCameraZ,
          smoothing
        )

        deck.position.x = THREE.MathUtils.lerp(
          deck.position.x,
          (1 - intro) * 1.35 - scroll * 0.35,
          smoothing
        )
        deck.position.y = THREE.MathUtils.lerp(
          deck.position.y,
          THREE.MathUtils.lerp(0.82, 0.28, intro) + scroll * 0.42,
          smoothing
        )
        deck.rotation.x = THREE.MathUtils.lerp(
          deck.rotation.x,
          THREE.MathUtils.lerp(0.34, pointerRotationX, intro) +
            scroll * 0.12,
          smoothing
        )
        deck.rotation.y = THREE.MathUtils.lerp(
          deck.rotation.y,
          THREE.MathUtils.lerp(-0.92, pointerRotationY, intro) -
            scroll * 0.2,
          smoothing
        )

        cards.forEach((card, index) => {
          const data = card.userData
          const reveal = data.reveal
          const isFocused = focusedIndex === index
          const isReceding = focusedIndex !== null && !isFocused
          const direction =
            focusedIndex === null
              ? 0
              : index < focusedIndex
                ? -0.12
                : index > focusedIndex
                  ? 0.12
                  : 0
          const float = Math.sin(time * 0.00072 + data.phase) * 0.035
          const restingY =
            data.base.y + (isFocused ? 0.1 : 0) + float
          const restingZ = isFocused
            ? 1.9
            : isReceding
              ? data.base.z - 0.75
              : data.base.z
          const scrollDepth = (1.5 - index) * 0.42 * scroll
          const focusXCompensation = isFocused
            ? (data.base.z - restingZ) * Math.tan(deck.rotation.y)
            : 0
          const restingX =
            data.base.x + direction + focusXCompensation
          data.hitArea.position.set(
            data.base.x + (index - 1.5) * 0.2 * scroll,
            data.base.y,
            data.base.z + scrollDepth + 0.12
          )
          const targetX = THREE.MathUtils.lerp(
            data.base.x * 0.08,
            restingX + (index - 1.5) * 0.2 * scroll,
            reveal
          )
          const targetY = THREE.MathUtils.lerp(
            index % 2 === 0 ? -0.55 : 0.55,
            restingY,
            reveal
          )
          const targetZ = THREE.MathUtils.lerp(
            -7.5 - index * 1.15,
            restingZ + scrollDepth,
            reveal
          )
          const restingScale = isFocused ? 1.08 : isReceding ? 0.95 : 1
          const targetScale = THREE.MathUtils.lerp(
            0.18,
            restingScale,
            reveal
          )
          const restingRotationX = isFocused
            ? -deck.rotation.x
            : data.base.rx
          const restingRotationY = isFocused
            ? -deck.rotation.y
            : data.base.ry
          const restingRotationZ = isFocused ? 0 : data.base.rz
          const targetRotationX = THREE.MathUtils.lerp(
            0.48,
            restingRotationX,
            reveal
          )
          const targetRotationY = THREE.MathUtils.lerp(
            (index - 1.5) * 0.22,
            restingRotationY,
            reveal
          )
          const targetRotationZ = THREE.MathUtils.lerp(
            0,
            restingRotationZ,
            reveal
          )

          card.position.x = THREE.MathUtils.lerp(
            card.position.x,
            targetX,
            smoothing
          )
          card.position.y = THREE.MathUtils.lerp(
            card.position.y,
            targetY,
            smoothing
          )
          card.position.z = THREE.MathUtils.lerp(
            card.position.z,
            targetZ,
            smoothing
          )
          card.rotation.x = THREE.MathUtils.lerp(
            card.rotation.x,
            targetRotationX,
            smoothing
          )
          card.rotation.y = THREE.MathUtils.lerp(
            card.rotation.y,
            targetRotationY,
            smoothing
          )
          card.rotation.z = THREE.MathUtils.lerp(
            card.rotation.z,
            targetRotationZ,
            smoothing
          )

          const currentScale = card.scale.x
          const nextScale = THREE.MathUtils.lerp(
            currentScale,
            targetScale,
            smoothing
          )
          card.scale.setScalar(nextScale)

          data.frontMaterial.color.lerp(
            isReceding ? dimmed : white,
            colourSmoothing
          )
          data.bodyMaterial.color.lerp(
            isReceding ? data.dimAccent : data.accent,
            colourSmoothing
          )
        })

        renderer.render(scene, camera)
      }
      requestAnimationFrame(animate)

      return {
        cards,
        state: motionState
      }
    } catch (error) {
      console.warn("The 3D project deck could not be initialised.", error)
      return null
    }
  }

  function initialiseHeroMotion(showreel) {
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
    gsap.set(".work-showreel-index, .work-showreel-legend", {
      y: 18,
      opacity: 0
    })

    if (!showreel) {
      gsap.set(".work-showreel-panel", {
        clipPath: "inset(48% 48% 48% 48%)",
        opacity: 0
      })
      gsap.set(".work-showreel-panel img", { opacity: 0 })
    }

    const initialiseHeroScroll = () => {
      const compact = window.matchMedia("(max-width: 700px)").matches
      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
          invalidateOnRefresh: true
        }
      })

      if (showreel) {
        scrollTimeline.to(
          showreel.state,
          {
            scroll: 1,
            ease: "none"
          },
          0
        )
      }

      scrollTimeline
        .to(
          ".work-showreel",
          {
            yPercent: compact ? 7 : 11,
            scale: compact ? 1.025 : 1.07,
            ease: "none"
          },
          0
        )
        .to(
          ".work-title-primary",
          {
            xPercent: compact ? -5 : -11,
            opacity: 0.48,
            ease: "none"
          },
          0
        )
        .to(
          ".work-title-acid",
          {
            xPercent: compact ? 5 : 10,
            scale: 1.035,
            transformOrigin: "left center",
            ease: "none"
          },
          0
        )
        .to(
          ".work-title-outline",
          {
            xPercent: compact ? -8 : -17,
            opacity: 0.12,
            ease: "none"
          },
          0
        )
        .to(
          ".work-hero-copy > p",
          {
            xPercent: -8,
            opacity: 0,
            ease: "none"
          },
          0
        )
        .to(
          ".work-hero-meta, .work-scroll-cue",
          {
            opacity: 0,
            ease: "none"
          },
          0
        )

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
      .addLabel("cards", "-=0.88")

    if (showreel) {
      entrance.to(
        showreel.state,
        {
          intro: 1,
          duration: 1.7,
          ease: "expo.out"
        },
        "cards"
      )

      showreel.cards
        .slice()
        .reverse()
        .forEach((card, index) => {
          entrance.to(
            card.userData,
            {
              reveal: 1,
              duration: 1.35,
              ease: "power4.out"
            },
            `cards+=${index * 0.11}`
          )
        })
    } else {
      entrance
        .to(".work-showreel-panel", {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 0.9,
          stagger: {
            each: 0.1,
            from: "center"
          },
          ease: "power4.out"
        }, "cards")
        .to(".work-showreel-panel img", {
          opacity: 1,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out"
        }, "cards+=0.15")
    }

    entrance
      .to(".work-showreel-index, .work-showreel-legend", {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out"
      }, "cards+=0.62")
      .to(".work-hero-meta, .work-hero-copy > p", {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.08
      }, "cards+=0.3")
      .to(title.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.1,
        ease: "power4.out"
      }, "cards+=0.46")
      .to(".work-scroll-cue", {
        y: 0,
        opacity: 1,
        duration: 0.5
      }, "cards+=0.92")
      .set(".work-hero-wipe", {
        display: "none"
      })

    if (!showreel) {
      entrance
        .set(".work-showreel-panel", {
          clearProps: "clipPath,opacity"
        })
        .set(".work-showreel-panel img", {
          clearProps: "opacity"
        })
    }

    entrance.eventCallback("onComplete", initialiseHeroScroll)

    if (!showreel && window.matchMedia("(pointer: fine)").matches) {
      gsap.set(".work-showreel-stage", {
        rotationX: -2,
        rotationY: -5,
        transformPerspective: 1400
      })
      const tiltX = gsap.quickTo(".work-showreel-stage", "rotationY", {
        duration: 0.9,
        ease: "power3.out"
      })
      const tiltY = gsap.quickTo(".work-showreel-stage", "rotationX", {
        duration: 0.9,
        ease: "power3.out"
      })

      const hero = document.querySelector(".work-hero")
      hero.addEventListener("pointermove", event => {
        tiltX((event.clientX / window.innerWidth - 0.5) * 16)
        tiltY((0.5 - event.clientY / window.innerHeight) * 10)
      })
      hero.addEventListener("pointerleave", () => {
        tiltX(-5)
        tiltY(-2)
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

  async function initialiseWorkPage() {
    renderProjects()
    initialiseFilters()

    const showreel = await initialiseWebGLShowreel()
    initialiseHeroMotion(showreel)
    initialiseProjectMotion()
  }

  initialiseWorkPage()
})()
