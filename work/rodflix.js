(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let heroModelController = null
  let heroModelRevealRequested = false

  function revealHeroModel() {
    heroModelRevealRequested = true
    heroModelController?.reveal()
  }

  async function initialiseHeroModel() {
    const host = document.querySelector(".rf-hero-screen")
    const canvas = host?.querySelector(".rf-hero-canvas")
    const status = host?.querySelector(".rf-model-status")
    const channelReadout = host?.querySelector(
      ".rf-model-interface span:first-child"
    )
    if (!host || !canvas) return null

    try {
      const THREE = await import("three")
      const { GLTFLoader } = await import(
        "three/addons/loaders/GLTFLoader.js"
      )

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100)
      const pivot = new THREE.Group()
      const asset = new THREE.Group()
      pivot.add(asset)
      scene.add(pivot)

      scene.add(new THREE.HemisphereLight(0xeeeae1, 0x08090b, 2.15))

      const keyLight = new THREE.DirectionalLight(0xffeee7, 3.4)
      keyLight.position.set(-4, 6, 8)
      scene.add(keyLight)

      const coralLight = new THREE.PointLight(0xff5c35, 8.5, 12, 2)
      coralLight.position.set(-3.8, 0.5, 4.5)
      scene.add(coralLight)

      const acidLight = new THREE.PointLight(0xd8ff3e, 6.8, 11, 2)
      acidLight.position.set(3.8, 2.6, 3)
      scene.add(acidLight)

      const channels = [
        {
          label: "HERO",
          src: "../assets/images/rodflixLaptopMockup.webp"
        },
        {
          label: "CATALOGUE",
          src: "../assets/images/rodflixLandingMockup2.webp"
        },
        {
          label: "SERIES",
          src: "../assets/images/rodflixSeriesMockup2.webp"
        },
        {
          label: "ADMIN",
          src: "../assets/images/rodflixManageSeries2.webp"
        },
        {
          label: "IMPORT",
          src: "../assets/images/rodflixImportSeriesMockup.webp"
        }
      ]

      const loadImage = src =>
        new Promise((resolve, reject) => {
          const image = new Image()
          image.decoding = "async"
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = src
        })

      const [gltf, channelImages] = await Promise.all([
        new GLTFLoader().loadAsync("../assets/models/old_tv.glb"),
        Promise.all(channels.map(channel => loadImage(channel.src)))
      ])

      const model = gltf.scene
      asset.add(model)
      model.updateMatrixWorld(true)

      let televisionScreen = model.getObjectByName(
        "polySurface2_phong2_0"
      )
      if (!televisionScreen) {
        model.traverse(child => {
          if (
            !televisionScreen &&
            child.isMesh &&
            child.material?.name === "phong2"
          ) {
            televisionScreen = child
          }
        })
      }
      if (!televisionScreen) {
        throw new Error("The television screen mesh was not found")
      }

      const modelBounds = new THREE.Box3().setFromObject(model)
      const modelCentre = modelBounds.getCenter(new THREE.Vector3())
      model.position.sub(modelCentre)
      model.updateMatrixWorld(true)

      const unscaledBounds = new THREE.Box3().setFromObject(asset)
      const unscaledSize = unscaledBounds.getSize(new THREE.Vector3())
      const largestDimension = Math.max(
        unscaledSize.x,
        unscaledSize.y,
        unscaledSize.z
      )
      const modelScale = 5.2 / Math.max(largestDimension, 0.0001)
      asset.scale.setScalar(modelScale)
      asset.updateMatrixWorld(true)

      const scaledBounds = new THREE.Box3().setFromObject(asset)
      const scaledCentre = scaledBounds.getCenter(new THREE.Vector3())
      asset.position.sub(scaledCentre)
      asset.updateMatrixWorld(true)

      model.traverse(child => {
        if (!child.isMesh) return
        child.castShadow = false
        child.receiveShadow = false

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        materials.filter(Boolean).forEach(material => {
          material.envMapIntensity = 0.62
          if (material.isMeshStandardMaterial) {
            material.emissive.set(0x111315)
            material.emissiveIntensity = 0.34
          }
          material.needsUpdate = true
        })
      })

      const screenCanvas = document.createElement("canvas")
      screenCanvas.width = 1024
      screenCanvas.height = 768
      const screenContext = screenCanvas.getContext("2d", {
        alpha: false
      })
      const noiseCanvas = document.createElement("canvas")
      noiseCanvas.width = 160
      noiseCanvas.height = 120
      const noiseContext = noiseCanvas.getContext("2d", {
        alpha: false
      })
      const screenTexture = new THREE.CanvasTexture(screenCanvas)
      screenTexture.colorSpace = THREE.SRGBColorSpace
      screenTexture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy()
      )
      screenTexture.minFilter = THREE.LinearFilter
      screenTexture.magFilter = THREE.LinearFilter

      const screenGeometry = televisionScreen.geometry.clone()
      const screenUvs = screenGeometry.getAttribute("uv")
      if (screenUvs) {
        let minU = Infinity
        let maxU = -Infinity
        let minV = Infinity
        let maxV = -Infinity

        for (let index = 0; index < screenUvs.count; index += 1) {
          minU = Math.min(minU, screenUvs.getX(index))
          maxU = Math.max(maxU, screenUvs.getX(index))
          minV = Math.min(minV, screenUvs.getY(index))
          maxV = Math.max(maxV, screenUvs.getY(index))
        }

        const width = Math.max(0.0001, maxU - minU)
        const height = Math.max(0.0001, maxV - minV)
        for (let index = 0; index < screenUvs.count; index += 1) {
          screenUvs.setXY(
            index,
            (screenUvs.getX(index) - minU) / width,
            (screenUvs.getY(index) - minV) / height
          )
        }
        screenUvs.needsUpdate = true
      }
      televisionScreen.geometry = screenGeometry

      const screenMaterial = new THREE.ShaderMaterial({
        toneMapped: false,
        side: THREE.DoubleSide,
        uniforms: {
          map: { value: screenTexture },
          time: { value: 0 },
          staticAmount: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float time;
          uniform float staticAmount;
          varying vec2 vUv;

          float random(vec2 value) {
            return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;
            float horizontalJitter =
              (random(vec2(floor(uv.y * 160.0), floor(time * 18.0))) - 0.5) *
              0.008 *
              staticAmount;
            uv.x += horizontalJitter;

            vec3 colour = texture2D(map, uv).rgb;
            float scanline = sin((uv.y * 720.0 + time * 7.0) * 3.14159);
            float vignette = 1.0 - smoothstep(
              0.22,
              0.88,
              length((uv - 0.5) * vec2(0.92, 1.12))
            );
            float noise = random(uv * vec2(640.0, 480.0) + time);

            colour *= 0.94 + vignette * 0.14;
            colour -= (scanline * 0.5 + 0.5) * 0.02;
            colour += (noise - 0.5) * (0.016 + staticAmount * 0.13);
            colour *= vec3(1.045, 1.015, 0.975);

            gl_FragColor = vec4(colour, 1.0);
          }
        `
      })
      televisionScreen.material = screenMaterial
      televisionScreen.renderOrder = 3

      const staticVideo = document.createElement("video")
      staticVideo.src = "../assets/videos/noSignal.mp4"
      staticVideo.muted = true
      staticVideo.defaultMuted = true
      staticVideo.playsInline = true
      staticVideo.preload = "auto"
      staticVideo.load()

      const drawCover = source => {
        if (!source || !screenContext) return
        const sourceWidth =
          source.videoWidth || source.naturalWidth || source.width
        const sourceHeight =
          source.videoHeight || source.naturalHeight || source.height
        if (!sourceWidth || !sourceHeight) return

        const scale = Math.max(
          screenCanvas.width / sourceWidth,
          screenCanvas.height / sourceHeight
        )
        const width = screenCanvas.width / scale
        const height = screenCanvas.height / scale
        const sourceX = (sourceWidth - width) / 2
        const sourceY = (sourceHeight - height) / 2

        screenContext.save()
        screenContext.fillStyle = "#050505"
        screenContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height)
        screenContext.filter =
          "saturate(0.94) contrast(1.04) brightness(1.16)"
        screenContext.drawImage(
          source,
          sourceX,
          sourceY,
          width,
          height,
          0,
          0,
          screenCanvas.width,
          screenCanvas.height
        )
        screenContext.restore()
      }

      const drawNoiseFallback = () => {
        if (!noiseContext || !screenContext) return
        const noise = noiseContext.createImageData(
          noiseCanvas.width,
          noiseCanvas.height
        )
        for (let index = 0; index < noise.data.length; index += 4) {
          const value = Math.random() * 255
          noise.data[index] = value
          noise.data[index + 1] = value
          noise.data[index + 2] = value
          noise.data[index + 3] = 255
        }
        noiseContext.putImageData(noise, 0, 0)
        screenContext.imageSmoothingEnabled = false
        screenContext.drawImage(
          noiseCanvas,
          0,
          0,
          screenCanvas.width,
          screenCanvas.height
        )
        screenContext.imageSmoothingEnabled = true
      }

      const completeBounds = new THREE.Box3().setFromObject(asset)
      const completeSize = completeBounds.getSize(new THREE.Vector3())
      const state = {
        reveal: reduceMotion ? 1 : 0,
        scroll: 0,
        pointerX: 0,
        pointerY: 0,
        currentX: 0,
        currentY: 0,
        entryTurn: reduceMotion ? 0 : Math.PI * 0.94,
        entryPitch: reduceMotion ? 0 : 0.18,
        entryRoll: reduceMotion ? 0 : -0.08,
        channelIndex: 0,
        channelMode: "image",
        phaseStarted: performance.now(),
        screenDirty: true,
        hasRevealed: reduceMotion
      }

      function resizeRenderer() {
        const width = Math.max(1, host.clientWidth)
        const height = Math.max(1, host.clientHeight)
        const aspect = width / height

        renderer.setSize(width, height, false)
        camera.aspect = aspect
        camera.updateProjectionMatrix()

        const verticalFov = THREE.MathUtils.degToRad(camera.fov)
        const distanceForHeight =
          completeSize.y / 2 / Math.tan(verticalFov / 2)
        const distanceForWidth =
          completeSize.x / 2 / (Math.tan(verticalFov / 2) * aspect)
        const mobile = width < 620
        const compactLandscape =
          width >= 620 && height <= 640 && aspect >= 1.25
        const framing = mobile
          ? 1.42
          : compactLandscape
            ? 1.5
            : aspect < 1.15
              ? 1.38
              : 1.3

        camera.position.set(
          0,
          completeSize.y * (mobile ? 0.025 : 0.04),
          Math.max(distanceForHeight, distanceForWidth) * framing
        )
        camera.lookAt(0, completeSize.y * 0.025, 0)
      }

      const resizeObserver = new ResizeObserver(resizeRenderer)
      resizeObserver.observe(host)
      resizeRenderer()

      function setPointer(event) {
        if (reduceMotion) return
        const bounds = host.getBoundingClientRect()
        state.pointerX = THREE.MathUtils.clamp(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -1,
          1
        )
        state.pointerY = THREE.MathUtils.clamp(
          ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
          -1,
          1
        )
      }

      function resetPointer() {
        state.pointerX = 0
        state.pointerY = 0
      }

      host.addEventListener("pointermove", setPointer)
      host.addEventListener("pointerleave", resetPointer)

      const clock = new THREE.Clock()
      let animationFrame = 0

      const updateChannelReadout = () => {
        const channelNumber = String(state.channelIndex + 1).padStart(2, "0")
        if (state.channelMode === "static") {
          if (status) status.textContent = "NO SIGNAL"
          if (channelReadout) {
            channelReadout.textContent = "RODFLIX BROADCAST / TUNING"
          }
          return
        }

        if (status) status.textContent = channels[state.channelIndex].label
        if (channelReadout) {
          channelReadout.textContent = `RODFLIX BROADCAST / CH ${channelNumber}`
        }
      }

      const beginStatic = now => {
        state.channelMode = "static"
        state.phaseStarted = now
        state.screenDirty = true
        host.dataset.broadcastState = "static"
        screenMaterial.uniforms.staticAmount.value = 1
        updateChannelReadout()

        if (staticVideo.readyState >= 2) {
          const availableDuration = Number.isFinite(staticVideo.duration)
            ? Math.max(0, staticVideo.duration - 0.8)
            : 0
          staticVideo.currentTime =
            availableDuration > 0
              ? (state.channelIndex * 0.47) % availableDuration
              : 0
          staticVideo.play().catch(() => {})
        }
      }

      const finishStatic = now => {
        staticVideo.pause()
        state.channelIndex = (state.channelIndex + 1) % channels.length
        state.channelMode = "image"
        state.phaseStarted = now
        state.screenDirty = true
        host.dataset.broadcastState = "image"
        screenMaterial.uniforms.staticAmount.value = 0
        updateChannelReadout()
      }

      drawCover(channelImages[0])
      screenTexture.needsUpdate = true
      host.dataset.broadcastState = "image"
      updateChannelReadout()

      function render() {
        const elapsed = clock.getElapsedTime()
        const now = performance.now()
        state.currentX += (state.pointerX - state.currentX) * 0.055
        state.currentY += (state.pointerY - state.currentY) * 0.055

        const revealedRotationY =
          -0.08 + state.currentX * 0.12 + state.scroll * 0.68
        const revealedRotationX =
          -0.025 - state.currentY * 0.055 - state.scroll * 0.14
        const idle = reduceMotion ? 0 : Math.sin(elapsed * 0.7) * 0.009

        pivot.rotation.y = revealedRotationY + state.entryTurn
        pivot.rotation.x = revealedRotationX + state.entryPitch
        pivot.rotation.z =
          idle + state.entryRoll + state.scroll * 0.09
        pivot.position.x = state.scroll * completeSize.x * 0.08
        pivot.position.y =
          THREE.MathUtils.lerp(
            -completeSize.y * 0.16,
            completeSize.y * 0.015,
            state.reveal
          ) -
          state.scroll * completeSize.y * 0.02
        pivot.position.z = -state.scroll * completeSize.z * 0.16

        const scale =
          THREE.MathUtils.lerp(0.72, 1, state.reveal) - state.scroll * 0.06
        pivot.scale.setScalar(scale)

        if (!reduceMotion && state.hasRevealed) {
          const phaseDuration =
            state.channelMode === "image" ? 3800 : 950
          if (now - state.phaseStarted >= phaseDuration) {
            if (state.channelMode === "image") beginStatic(now)
            else finishStatic(now)
          }
        }

        if (state.channelMode === "static") {
          if (staticVideo.readyState >= 2) drawCover(staticVideo)
          else drawNoiseFallback()
          screenTexture.needsUpdate = true
          state.screenDirty = false
        } else if (state.screenDirty) {
          drawCover(channelImages[state.channelIndex])
          screenTexture.needsUpdate = true
          state.screenDirty = false
        }

        screenMaterial.uniforms.time.value = elapsed
        coralLight.intensity =
          state.channelMode === "static"
            ? 11 + Math.sin(elapsed * 35) * 2
            : 8.5

        renderer.render(scene, camera)
        animationFrame = window.requestAnimationFrame(render)
      }

      render()
      host.dataset.modelState = "ready"

      const controller = {
        reveal() {
          if (!state.hasRevealed) {
            state.hasRevealed = true
            state.phaseStarted = performance.now()
          }

          if (typeof gsap !== "undefined" && !reduceMotion) {
            gsap.killTweensOf(state)
            gsap
              .timeline()
              .to(state, {
                reveal: 0.5,
                entryTurn: Math.PI * 0.42,
                entryPitch: 0.09,
                entryRoll: 0.045,
                duration: 0.78,
                ease: "power2.inOut"
              })
              .to(state, {
                reveal: 1,
                entryTurn: 0,
                entryPitch: 0,
                entryRoll: 0,
                duration: 1.12,
                ease: "power4.out"
              })
          } else {
            state.reveal = 1
            state.entryTurn = 0
            state.entryPitch = 0
            state.entryRoll = 0
          }
        },
        setScrollProgress(progress) {
          state.scroll = progress
        },
        destroy() {
          window.cancelAnimationFrame(animationFrame)
          resizeObserver.disconnect()
          host.removeEventListener("pointermove", setPointer)
          host.removeEventListener("pointerleave", resetPointer)
          staticVideo.pause()
          staticVideo.removeAttribute("src")
          staticVideo.load()
          renderer.dispose()
          screenTexture.dispose()
          screenGeometry.dispose()
          screenMaterial.dispose()
        }
      }

      if (heroModelRevealRequested || reduceMotion) controller.reveal()
      return controller
    } catch (error) {
      host.dataset.modelState = "error"
      if (status) status.textContent = "IMAGE MODE"
      console.warn("The RodFlix television could not be loaded.", error)
      return null
    }
  }

  function initialiseEntry() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    const title = new SplitText(".rf-hero-copy h1", { type: "chars" })
    const entryCopy = new SplitText(".rf-entry span", { type: "words" })
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(".rf-entry", { display: "none" })
        initialiseScrollMotion()
      }
    })

    gsap.set(".rf-entry", { display: "block" })
    gsap.set(".rf-entry i", { yPercent: 0 })
    gsap.set(entryCopy.words, { y: 18, opacity: 0 })
    gsap.set(title.chars, { yPercent: 115, opacity: 0 })
    gsap.set(".rf-kicker, .rf-hero-intro, .rf-hero-actions, .rf-hero-meta, .rf-scroll-cue", {
      y: 24,
      opacity: 0
    })
    gsap.set(".rf-hero-screen", {
      clipPath: "inset(50% 50% 50% 50%)",
      scale: 0.92
    })

    timeline
      .to(entryCopy.words, {
        y: 0,
        opacity: 1,
        duration: 0.48,
        stagger: 0.06,
        ease: "power3.out"
      })
      .to(".rf-entry span", {
        y: -12,
        opacity: 0,
        duration: 0.32,
        delay: 0.32,
        ease: "power2.in"
      })
      .to(".rf-entry i", {
        yPercent: index => index % 2 ? 105 : -105,
        duration: 1.05,
        stagger: {
          each: 0.08,
          from: "edges"
        },
        ease: "power4.inOut"
      })
      .call(revealHeroModel, null, "-=0.82")
      .to(".rf-hero-screen", {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: 1.15,
        ease: "power4.inOut"
      }, "-=0.88")
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

    const compact = window.matchMedia("(max-width: 900px)").matches
    const heroExit = gsap.timeline({
      scrollTrigger: {
        trigger: ".rf-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.15,
        onUpdate: self => heroModelController?.setScrollProgress(self.progress)
      }
    })

    heroExit
      .to(
        ".rf-hero-screen",
        {
          xPercent: compact ? 0 : 5,
          yPercent: compact ? 10 : 14,
          scale: compact ? 0.94 : 0.97,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-title-rod",
        {
          xPercent: compact ? -10 : -22,
          yPercent: -24,
          rotation: -2.5,
          opacity: 0.08,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-title-flix",
        {
          xPercent: compact ? 10 : 24,
          yPercent: -16,
          rotation: 2.5,
          opacity: 0.08,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-kicker",
        {
          x: compact ? -24 : -80,
          y: -35,
          letterSpacing: "0.22em",
          opacity: 0,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-hero-intro",
        {
          x: compact ? -18 : -55,
          y: -70,
          opacity: 0,
          ease: "none"
        },
        0.04
      )
      .to(
        ".rf-hero-actions a:first-child",
        {
          x: compact ? -25 : -65,
          y: 85,
          rotation: -2,
          opacity: 0,
          ease: "none"
        },
        0.04
      )
      .to(
        ".rf-hero-actions a:last-child",
        {
          x: compact ? 25 : 65,
          y: 105,
          rotation: 2,
          opacity: 0,
          ease: "none"
        },
        0.04
      )
      .to(
        ".rf-hero-meta span:first-child",
        {
          x: compact ? -20 : -90,
          opacity: 0,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-hero-meta span:last-child",
        {
          x: compact ? 20 : 90,
          opacity: 0,
          ease: "none"
        },
        0
      )
      .to(
        ".rf-scroll-cue",
        {
          x: -55,
          y: 35,
          opacity: 0,
          ease: "none"
        },
        0.08
      )
      .to(
        ".rf-model-aura",
        {
          scale: 1.18,
          opacity: 0.18,
          ease: "none"
        },
        0
      )

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

    gsap.from(".rf-brief-copy > *", {
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

    const flapCounters = Array.from(
      document.querySelectorAll(".rf-brief-stats [data-flap-value]")
    )

    flapCounters.forEach(counter => {
      const target = counter.dataset.flapValue.padStart(2, "0")
      counter.setAttribute("aria-label", target)
      counter.innerHTML = target
        .split("")
        .map(
          () =>
            '<span class="rf-flap-digit" aria-hidden="true"><i>0</i></span>'
        )
        .join("")
    })

    const rollBriefCounters = () => {
      flapCounters.forEach((counter, counterIndex) => {
        const target = counter.dataset.flapValue.padStart(2, "0")
        const digits = Array.from(counter.querySelectorAll(".rf-flap-digit i"))

        digits.forEach((digit, digitIndex) => {
          const targetDigit = Number(target[digitIndex])
          const turns = 9 + counterIndex * 2 + digitIndex * 2
          let currentDigit = (targetDigit - turns + 100) % 10
          const timeline = gsap.timeline({
            delay: counterIndex * 0.14 + digitIndex * 0.04
          })

          digit.textContent = String(currentDigit)

          for (let turn = 0; turn < turns; turn += 1) {
            const nextDigit =
              turn === turns - 1 ? targetDigit : (currentDigit + 1) % 10

            timeline
              .to(digit, {
                yPercent: -82,
                rotationX: -78,
                opacity: 0.12,
                duration: 0.045,
                ease: "power1.in"
              })
              .call(() => {
                digit.textContent = String(nextDigit)
              })
              .set(digit, {
                yPercent: 82,
                rotationX: 78,
                opacity: 0.12
              })
              .to(digit, {
                yPercent: 0,
                rotationX: 0,
                opacity: 1,
                duration: 0.055,
                ease: "power1.out"
              })

            currentDigit = nextDigit
          }
        })
      })
    }

    gsap.from(".rf-brief-stats div", {
      opacity: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".rf-brief-stats",
        start: "top 82%"
      }
    })

    ScrollTrigger.create({
      trigger: ".rf-brief-stats",
      start: "top 82%",
      once: true,
      onEnter: rollBriefCounters
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

    initialiseHeroModel().then(controller => {
      heroModelController = controller
      if (heroModelRevealRequested) heroModelController?.reveal()
    })

    if (reduceMotion) {
      revealHeroModel()
      return
    }
    initialiseEntry()
  })
})()
