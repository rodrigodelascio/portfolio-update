(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let polaroidController = null
  let polaroidRevealRequested = false

  function revealPolaroidHero() {
    polaroidRevealRequested = true
    polaroidController?.reveal()
  }

  async function initialisePolaroidHero() {
    const host = document.querySelector(".lis-polaroid-stage")
    const canvas = host?.querySelector(".lis-polaroid-canvas")
    const flashOverlay = host?.querySelector(".lis-polaroid-flash")
    const status = host?.querySelector(".lis-polaroid-status")
    if (!host || !canvas || !flashOverlay) return null

    const mockups = [
      "../assets/images/letItShineHome.webp",
      "../assets/images/letItShineServices.webp",
      "../assets/images/letItShineAbout.webp",
      "../assets/images/letItShineTabletHome.webp",
      "../assets/images/letItShineIphoneHome.webp"
    ]

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
      renderer.toneMappingExposure = 1.12

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100)
      camera.position.set(0, 0.05, 9.2)

      const world = new THREE.Group()
      const cameraRig = new THREE.Group()
      const photoDeck = new THREE.Group()
      cameraRig.visible = false
      world.add(cameraRig, photoDeck)
      scene.add(world)

      scene.add(new THREE.HemisphereLight(0xf3eee5, 0x08090b, 2.4))

      const keyLight = new THREE.DirectionalLight(0xfff4e9, 4.2)
      keyLight.position.set(-4, 6, 8)
      scene.add(keyLight)

      const tealLight = new THREE.PointLight(0x149d98, 8, 13, 2)
      tealLight.position.set(3.8, 1.2, 4.5)
      scene.add(tealLight)

      const coralLight = new THREE.PointLight(0xff5c35, 9, 14, 2)
      coralLight.position.set(-3.8, 1, 4.2)
      scene.add(coralLight)

      const flashLight = new THREE.PointLight(0xffffff, 0, 16, 1.4)
      flashLight.position.set(-0.4, 1.8, 4.8)
      scene.add(flashLight)

      const loader = new GLTFLoader()
      const loadImage = src =>
        new Promise((resolve, reject) => {
          const image = new Image()
          image.decoding = "async"
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = src
        })

      const [cameraGltf, photoGltf, images] = await Promise.all([
        loader.loadAsync("../assets/models/polaroid_camera.glb"),
        loader.loadAsync("../assets/models/polaroid_photo.glb"),
        Promise.all(mockups.map(loadImage))
      ])

      const cameraModel = cameraGltf.scene
      cameraRig.add(cameraModel)
      cameraModel.updateMatrixWorld(true)

      const cameraBounds = new THREE.Box3().setFromObject(cameraModel)
      const cameraCentre = cameraBounds.getCenter(new THREE.Vector3())
      const cameraSize = cameraBounds.getSize(new THREE.Vector3())
      const cameraScale = 3.2 / Math.max(
        cameraSize.x,
        cameraSize.y,
        cameraSize.z,
        0.0001
      )
      cameraModel.scale.setScalar(cameraScale)
      cameraModel.position.copy(cameraCentre).multiplyScalar(-cameraScale)

      cameraModel.traverse(child => {
        if (!child.isMesh) return
        child.castShadow = false
        child.receiveShadow = false
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        child.material = materials.map(material => {
          const clone = material.clone()
          clone.envMapIntensity = 0.7
          if (clone.isMeshStandardMaterial) {
            clone.roughness = Math.max(0.32, clone.roughness)
          }
          return clone
        })
        if (child.material.length === 1) {
          child.material = child.material[0]
        }
      })

      const sourcePhoto = photoGltf.scene
      sourcePhoto.updateMatrixWorld(true)
      const sourcePhotoBounds = new THREE.Box3().setFromObject(sourcePhoto)
      const sourcePhotoCentre = sourcePhotoBounds.getCenter(new THREE.Vector3())
      const photoFrontNormal = new THREE.Vector3(0, 0, 1)
      sourcePhoto.traverse(child => {
        if (!child.isMesh) return
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        const isFront = materials.some(
          material => material?.name === "Frameblinn2SG"
        )
        const normals = child.geometry?.attributes?.normal
        if (!isFront || !normals?.count) return
        photoFrontNormal
          .fromBufferAttribute(normals, 0)
          .transformDirection(child.matrixWorld)
          .normalize()
      })
      const photoAlignment = new THREE.Quaternion().setFromUnitVectors(
        photoFrontNormal,
        new THREE.Vector3(0, 0, 1)
      )

      function createMockupTexture(image) {
        const textureCanvas = document.createElement("canvas")
        textureCanvas.width = 960
        textureCanvas.height = 760
        const context = textureCanvas.getContext("2d", { alpha: false })
        context.fillStyle = "#111416"
        context.fillRect(0, 0, textureCanvas.width, textureCanvas.height)

        const sourceRatio = image.naturalWidth / image.naturalHeight
        const targetRatio = textureCanvas.width / textureCanvas.height
        let drawWidth = textureCanvas.width
        let drawHeight = textureCanvas.height

        if (sourceRatio > targetRatio) {
          drawHeight = drawWidth / sourceRatio
        } else {
          drawWidth = drawHeight * sourceRatio
        }

        drawWidth *= 0.94
        drawHeight *= 0.94
        const drawX = (textureCanvas.width - drawWidth) / 2
        const drawY = (textureCanvas.height - drawHeight) / 2

        context.drawImage(
          image,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        )

        const texture = new THREE.CanvasTexture(textureCanvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.flipY = true
        texture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy()
        )
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        return texture
      }

      function mapTextureToPhotoFace(texture, geometry) {
        const uv = geometry?.attributes?.uv
        if (!uv?.count) return

        let minU = Infinity
        let minV = Infinity
        let maxU = -Infinity
        let maxV = -Infinity
        for (let index = 0; index < uv.count; index += 1) {
          const u = uv.getX(index)
          const v = uv.getY(index)
          minU = Math.min(minU, u)
          minV = Math.min(minV, v)
          maxU = Math.max(maxU, u)
          maxV = Math.max(maxV, v)
        }

        const rangeU = Math.max(maxU - minU, 0.0001)
        const rangeV = Math.max(maxV - minV, 0.0001)
        texture.repeat.set(1 / rangeU, 1 / rangeV)
        texture.offset.set(-minU / rangeU, -minV / rangeV)
        texture.needsUpdate = true
      }

      const photos = images.map((image, index) => {
        const print = new THREE.Group()
        const modelRoot = new THREE.Group()
        const photoModel = sourcePhoto.clone(true)
        const imageMaterial = new THREE.MeshBasicMaterial({
          map: createMockupTexture(image),
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          toneMapped: false
        })

        photoModel.position.copy(sourcePhotoCentre).multiplyScalar(-1)
        modelRoot.quaternion.copy(photoAlignment)
        modelRoot.quaternion.premultiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            0.24
          )
        )
        modelRoot.add(photoModel)
        print.add(modelRoot)

        photoModel.traverse(child => {
          if (!child.isMesh) return
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material]
          const isPhotoFace = materials.some(
            material => material?.name === "Frameblinn2SG"
          )

          if (isPhotoFace) {
            mapTextureToPhotoFace(imageMaterial.map, child.geometry)
            child.material = imageMaterial
            child.renderOrder = 3
            return
          }

          const clonedMaterials = materials.map(material => {
            const clone = material.clone()
            clone.side = THREE.DoubleSide
            clone.envMapIntensity = 0.42
            if (clone.isMeshStandardMaterial) {
              clone.roughness = Math.max(0.48, clone.roughness)
            }
            return clone
          })
          child.material =
            clonedMaterials.length === 1
              ? clonedMaterials[0]
              : clonedMaterials
        })

        modelRoot.updateMatrixWorld(true)
        const alignedBounds = new THREE.Box3().setFromObject(modelRoot)
        const alignedSize = alignedBounds.getSize(new THREE.Vector3())
        const modelScale = 2.2 / Math.max(alignedSize.y, 0.0001)
        modelRoot.scale.setScalar(modelScale)

        print.userData.imageMaterial = imageMaterial
        print.userData.model = photoModel
        print.userData.index = index
        print.visible = false
        photoDeck.add(print)
        return print
      })

      let revealed = false
      let settled = false
      let destroyed = false
      const pointer = new THREE.Vector2()
      const pointerTarget = new THREE.Vector2()

      function getLayout() {
        const width = host.clientWidth
        const mobile = width < 600
        const tablet = width < 900
        return {
          mobile,
          tablet,
          captures: mobile ? 3 : 5,
          cameraScale: mobile ? 0.78 : tablet ? 0.9 : 1,
          ejectionScale: mobile ? 1.02 : tablet ? 1.28 : 1.5,
          cardScale: mobile ? 1.1 : tablet ? 1.46 : 1.76,
          compositionScale: mobile ? 0.65 : tablet ? 0.84 : 1.04,
          cameraX: mobile ? 0.15 : tablet ? 0.35 : 0.7,
          cameraY: mobile ? 0.55 : 0.68,
          finalCameraX: mobile ? 2.8 : tablet ? 3.4 : 4.2,
          finalCameraY: mobile ? -2.7 : -2.9
        }
      }

      function finalPhotoState(index, layout) {
        const positions = [
          [-0.9, 1.02],
          [0.9, 1.02],
          [-1.72, -1.02],
          [0, -1.02],
          [1.72, -1.02]
        ]
        const rotations = [-0.035, 0.026, 0.038, -0.018, 0.032]
        const [x, y] = positions[index]
        return {
          x: x * layout.compositionScale,
          y: y * layout.compositionScale,
          z: index * 0.12,
          rz: rotations[index],
          ry: 0,
          scale: layout.cardScale
        }
      }

      function holdingPhotoState(index, layout) {
        return {
          x: (index - 2) * 1.15 * layout.compositionScale,
          y: layout.cameraY - 2.2,
          z: -0.78,
          scale: layout.ejectionScale * 0.48
        }
      }

      function placeFinalComposition() {
        const layout = getLayout()
        cameraRig.visible = false
        photos.forEach((print, index) => {
          const finalState = finalPhotoState(index, layout)
          print.visible = true
          print.position.set(finalState.x, finalState.y, finalState.z)
          print.rotation.set(0, finalState.ry, finalState.rz)
          print.scale.setScalar(finalState.scale)
          print.userData.imageMaterial.opacity = 1
        })
        status.textContent = "FIVE FRAMES READY"
        settled = true
        host.dataset.polaroidState = "ready"
      }

      function flash(timeline, at) {
        timeline
          .fromTo(
            flashOverlay,
            { opacity: 0, scale: 0.72 },
            {
              opacity: 0.98,
              scale: 1,
              duration: 0.065,
              ease: "power4.out"
            },
            at
          )
          .to(
            flashOverlay,
            {
              opacity: 0,
              scale: 1.16,
              duration: 0.34,
              ease: "expo.out"
            },
            at + 0.065
          )
          .to(
            flashLight,
            {
              intensity: 48,
              duration: 0.045,
              ease: "power4.out"
            },
            at
          )
          .to(
            flashLight,
            {
              intensity: 0,
              duration: 0.3,
              ease: "power2.out"
            },
            at + 0.045
          )
      }

      function reveal() {
        if (revealed) return
        revealed = true

        if (reduceMotion) {
          placeFinalComposition()
          return
        }

        const layout = getLayout()
        const captureYaw = Math.PI + 0.38
        const retreatYaw = Math.PI * 2 + 0.52
        const timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            settled = true
            status.textContent = "FIVE FRAMES READY"
            host.dataset.polaroidState = "ready"
          }
        })

        cameraRig.visible = true
        cameraRig.position.set(layout.cameraX, layout.cameraY, -0.2)
        cameraRig.rotation.set(-0.08, 0.04, -0.04)
        cameraRig.scale.setScalar(0.001)

        timeline
          .call(() => {
            status.textContent = "CAMERA ONLINE"
          }, null, 0)
          .to(
            cameraRig.scale,
            {
              x: layout.cameraScale,
              y: layout.cameraScale,
              z: layout.cameraScale,
              duration: 0.85,
              ease: "back.out(1.45)"
            },
            0
          )
          .to(
            cameraRig.rotation,
            {
              x: 0,
              y: captureYaw,
              z: 0,
              duration: 1.45,
              ease: "expo.inOut"
            },
            0.08
          )

        const captureGap = layout.mobile ? 1.2 : 1.12
        const firstCapture = 1.48

        for (let index = 0; index < layout.captures; index += 1) {
          const print = photos[index]
          const finalState = finalPhotoState(index, layout)
          const holdingState = holdingPhotoState(index, layout)
          const captureAt = firstCapture + index * captureGap

          timeline.call(() => {
            status.textContent = `FRAME 0${index + 1} / DEVELOPING`
            print.visible = true
            print.position.set(
              layout.cameraX,
              layout.cameraY - 0.64,
              -0.48
            )
            print.rotation.set(
              -Math.PI / 2,
              0,
              0
            )
            print.scale.setScalar(layout.ejectionScale * 0.42)
            print.userData.imageMaterial.opacity = 0
          }, null, captureAt)

          flash(timeline, captureAt)

          timeline
            .to(
              cameraRig.rotation,
              {
                x: -0.09,
                z: index % 2 ? 0.025 : -0.025,
                duration: 0.11,
                ease: "power2.out"
              },
              captureAt
            )
            .to(
              cameraRig.rotation,
              {
                x: 0,
                z: 0,
                duration: 0.28,
                ease: "back.out(2)"
              },
              captureAt + 0.11
            )
            .to(
              print.position,
              {
                y: layout.cameraY - 1.7,
                z: -0.85,
                duration: 0.46,
                ease: "power3.out"
              },
              captureAt + 0.08
            )
            .to(
              print.scale,
              {
                x: layout.ejectionScale * 0.52,
                y: layout.ejectionScale * 0.52,
                z: layout.ejectionScale * 0.52,
                duration: 0.46,
                ease: "power3.out"
              },
              captureAt + 0.08
            )
            .to(
              print.position,
              {
                y: layout.cameraY - 2.18,
                z: -0.75,
                duration: 0.48,
                ease: "power3.inOut"
              },
              captureAt + 0.54
            )
            .to(
              print.rotation,
              {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.48,
                ease: "power3.inOut"
              },
              captureAt + 0.54
            )
            .to(
              print.scale,
              {
                x: layout.ejectionScale * 0.7,
                y: layout.ejectionScale * 0.7,
                z: layout.ejectionScale * 0.7,
                duration: 0.48,
                ease: "power3.inOut"
              },
              captureAt + 0.54
            )
            .to(
              print.userData.imageMaterial,
              {
                opacity: 1,
                duration: 0.42,
                ease: "power1.in"
              },
              captureAt + 0.66
            )
            .to(
              print.position,
              {
                x: holdingState.x,
                duration: 0.42,
                ease: "power3.inOut"
              },
              captureAt + 1.02
            )
            .to(
              print.position,
              {
                x: holdingState.x,
                y: holdingState.y,
                z: holdingState.z,
                duration: 0.58,
                ease: "power3.inOut"
              },
              captureAt + 1.44
            )
            .to(
              print.rotation,
              {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.58,
                ease: "power3.inOut"
              },
              captureAt + 1.44
            )
            .to(
              print.scale,
              {
                x: holdingState.scale,
                y: holdingState.scale,
                z: holdingState.scale,
                duration: 0.58,
                ease: "power3.inOut"
              },
              captureAt + 1.44
            )
        }

        const finalAt =
          firstCapture + (layout.captures - 1) * captureGap + 2.06

        if (layout.captures < photos.length) {
          photos.slice(layout.captures).forEach((print, offset) => {
            const index = layout.captures + offset
            const holdingState = holdingPhotoState(index, layout)
            timeline.call(() => {
              print.visible = true
              print.position.set(
                holdingState.x,
                holdingState.y,
                holdingState.z
              )
              print.rotation.set(0, 0, 0)
              print.scale.setScalar(0.01)
              print.userData.imageMaterial.opacity = 1
            }, null, finalAt + offset * 0.08)
            timeline.to(
              print.scale,
              {
                x: holdingState.scale,
                y: holdingState.scale,
                z: holdingState.scale,
                duration: 0.62,
                ease: "back.out(1.7)"
              },
              finalAt + offset * 0.08
            )
          })
        }

        timeline
          .call(() => {
            status.textContent = "FIVE FRAMES / KEEPERS"
          }, null, finalAt)
          .to(
            cameraRig.position,
            {
              x: layout.finalCameraX,
              y: layout.finalCameraY,
              z: -2.2,
              duration: 1.05,
              ease: "power4.inOut"
            },
            finalAt
          )
          .to(
            cameraRig.rotation,
            {
              x: -0.22,
              y: retreatYaw,
              z: -0.12,
              duration: 1.05,
              ease: "power4.inOut"
            },
            finalAt
          )
          .to(
            cameraRig.scale,
            {
              x: layout.cameraScale * 0.08,
              y: layout.cameraScale * 0.08,
              z: layout.cameraScale * 0.08,
              duration: 1.05,
              ease: "power4.inOut"
            },
            finalAt
          )
          .call(() => {
            cameraRig.visible = false
          }, null, finalAt + 1.05)

        const compositionAt = finalAt + 1.08
        photos.forEach((print, index) => {
          const finalState = finalPhotoState(index, layout)
          const stagger = index * 0.045
          timeline
            .to(
              print.position,
              {
                x: finalState.x,
                y: finalState.y,
                z: finalState.z,
                duration: 0.92,
                ease: "expo.inOut"
              },
              compositionAt + stagger
            )
            .to(
              print.rotation,
              {
                x: 0,
                y: 0,
                z: finalState.rz,
                duration: 0.92,
                ease: "expo.inOut"
              },
              compositionAt + stagger
            )
            .to(
              print.scale,
              {
                x: finalState.scale,
                y: finalState.scale,
                z: finalState.scale,
                duration: 0.92,
                ease: "back.out(1.18)"
              },
              compositionAt + stagger
            )
        })
      }

      function resize() {
        const bounds = host.getBoundingClientRect()
        if (!bounds.width || !bounds.height) return
        renderer.setSize(bounds.width, bounds.height, false)
        camera.aspect = bounds.width / bounds.height
        camera.updateProjectionMatrix()

        if (!settled) return
        const layout = getLayout()
        photos.forEach((print, index) => {
          const finalState = finalPhotoState(index, layout)
          print.position.set(finalState.x, finalState.y, finalState.z)
          print.rotation.set(0, finalState.ry, finalState.rz)
          print.scale.setScalar(finalState.scale)
        })
        cameraRig.position.set(
          layout.finalCameraX,
          layout.finalCameraY,
          -2.2
        )
        cameraRig.rotation.set(
          -0.22,
          Math.PI * 2 + 0.52,
          -0.12
        )
        cameraRig.scale.setScalar(layout.cameraScale * 0.08)
      }

      function onPointerMove(event) {
        const bounds = host.getBoundingClientRect()
        pointerTarget.x =
          ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
        pointerTarget.y =
          -((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      }

      function onPointerLeave() {
        pointerTarget.set(0, 0)
      }

      host.addEventListener("pointermove", onPointerMove)
      host.addEventListener("pointerleave", onPointerLeave)
      window.addEventListener("resize", resize)
      resize()

      function render() {
        if (destroyed) return
        pointer.lerp(pointerTarget, 0.045)
        if (settled && !reduceMotion) {
          photoDeck.rotation.y +=
            (pointer.x * 0.085 - photoDeck.rotation.y) * 0.045
          photoDeck.rotation.x +=
            (-pointer.y * 0.045 - photoDeck.rotation.x) * 0.045
          photoDeck.position.x +=
            (pointer.x * 0.08 - photoDeck.position.x) * 0.035
          photoDeck.position.y +=
            (pointer.y * 0.055 - photoDeck.position.y) * 0.035
        }
        renderer.render(scene, camera)
        requestAnimationFrame(render)
      }

      host.dataset.polaroidState = "loaded"
      status.textContent = "FILM LOADED"
      render()

      polaroidController = {
        reveal,
        destroy() {
          destroyed = true
          window.removeEventListener("resize", resize)
          host.removeEventListener("pointermove", onPointerMove)
          host.removeEventListener("pointerleave", onPointerLeave)
          renderer.dispose()
        }
      }

      if (polaroidRevealRequested) reveal()
      return polaroidController
    } catch (error) {
      console.warn("The Polaroid hero could not be initialised", error)
      host.dataset.polaroidState = "error"
      status.textContent = "FIVE FRAMES READY"
      return null
    }
  }

  function initialiseEntry() {
    const entry = document.querySelector(".lis-entry")
    const hero = document.querySelector(".lis-hero")
    if (!entry || !hero) return

    if (reduceMotion) {
      entry.remove()
      revealPolaroidHero()
      return
    }

    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)

    const heroLines = gsap.utils.toArray(".lis-hero h1 > *")
    gsap.set(".lis-hero-meta span", { y: 18, opacity: 0 })
    gsap.set(".lis-kicker", { x: -28, opacity: 0 })
    gsap.set(heroLines, {
      yPercent: 105,
      rotateZ: -2,
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      transformOrigin: "left bottom"
    })
    gsap.set(".lis-hero-intro", { y: 26, opacity: 0 })
    gsap.set(".lis-actions > *", { y: 22, opacity: 0 })
    gsap.set(".lis-scroll-cue", { y: 18, opacity: 0 })
    gsap.set(".lis-polaroid-stage", {
      clipPath: "inset(46% 42% 46% 42% round 3rem)",
      scale: 0.9,
      opacity: 0
    })

    const timeline = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        entry.remove()
        document.body.style.overflow = ""
        window.scrollTo(0, 0)
        ScrollTrigger.refresh()
      }
    })

    timeline
      .from(".lis-entry-mark span", {
        yPercent: 120,
        opacity: 0,
        duration: 0.75
      }, 0.08)
      .to(".lis-entry-mark", {
        yPercent: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      }, 1.05)
      .to(".lis-entry-panel-a", {
        yPercent: -105,
        duration: 1.05
      }, 1.18)
      .to(".lis-entry-panel-b", {
        yPercent: 105,
        duration: 1.05
      }, 1.27)
      .to(".lis-entry-panel-c", {
        yPercent: -105,
        duration: 1.05
      }, 1.32)
      .to(".lis-entry-panel-d", {
        yPercent: 105,
        duration: 1.05
      }, 1.39)
      .call(() => entry.remove(), null, 2.46)
      .to(".lis-hero-meta span", {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out"
      }, 2.52)
      .to(".lis-kicker", {
        x: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power3.out"
      }, 2.6)
      .to(heroLines, {
        yPercent: 0,
        rotateZ: 0,
        opacity: 1,
        clipPath: "inset(0 0 0% 0)",
        duration: 1,
        stagger: 0.12,
        ease: "expo.out"
      }, 2.64)
      .to(".lis-hero-intro", {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: "power3.out"
      }, 3.02)
      .to(".lis-actions > *", {
        y: 0,
        opacity: 1,
        duration: 0.62,
        stagger: 0.08,
        ease: "power3.out"
      }, 3.14)
      .to(".lis-scroll-cue", {
        y: 0,
        opacity: 1,
        duration: 0.62,
        ease: "power3.out"
      }, 3.24)
      .to(".lis-polaroid-stage", {
        clipPath: "inset(0% 0% 0% 0% round 0rem)",
        scale: 1,
        opacity: 1,
        duration: 1.15,
        ease: "expo.out"
      }, 2.5)
      .call(revealPolaroidHero, null, 2.92)
  }

  function initialiseHeroScroll() {
    const hero = document.querySelector(".lis-hero")
    if (!hero || reduceMotion) return

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1.1
      }
    })

    timeline
      .to(".lis-hero-copy", {
        yPercent: 18,
        xPercent: -4,
        opacity: 0.18,
        ease: "none"
      }, 0)
      .to(".lis-polaroid-stage", {
        yPercent: 12,
        rotate: -2.4,
        scale: 1.055,
        ease: "none"
      }, 0)
      .to(".lis-hero-meta, .lis-scroll-cue", {
        opacity: 0,
        ease: "none"
      }, 0)
  }

  function initialiseSectionMotion() {
    if (reduceMotion) return

    gsap.utils.toArray(".lis-section-label").forEach(label => {
      gsap.from(label, {
        x: -28,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: label,
          start: "top 88%",
          once: true
        }
      })
    })

    const headingSelectors = [
      ".lis-brief-heading h2",
      ".lis-system-copy h2",
      ".lis-decisions-heading h2",
      ".lis-responsive-heading h2",
      ".lis-features-heading h2",
      ".lis-gallery-heading h2",
      ".lis-learning-copy h2",
      ".lis-outro-copy h2"
    ]

    headingSelectors.forEach(selector => {
      const heading = document.querySelector(selector)
      if (!heading) return

      gsap.from(heading, {
        clipPath: "inset(0 0 100% 0)",
        y: 36,
        duration: 1.05,
        ease: "power4.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 84%",
          once: true
        }
      })
    })

    gsap.from(".lis-brief-copy > *", {
      y: 36,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-brief-copy",
        start: "top 80%",
        once: true
      }
    })

    gsap.from(".lis-responsibilities > div", {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-responsibilities",
        start: "top 88%",
        once: true
      }
    })
  }

  function initialisePromise() {
    const section = document.querySelector(".lis-promise")
    if (!section || reduceMotion) return

    gsap.fromTo(".lis-promise figure img", {
      scale: 1.08,
      yPercent: -2.5
    }, {
      scale: 1,
      yPercent: 2.5,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.1
      }
    })

    gsap.from(".lis-promise-copy > p, .lis-promise-copy > h2", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        once: true
      }
    })

    gsap.from(".lis-promise-note span", {
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-promise-note",
        start: "top 90%",
        once: true
      }
    })
  }

  function initialiseProcess() {
    if (reduceMotion) return

    gsap.utils.toArray(".lis-process-card").forEach((card, index) => {
      gsap.from(card, {
        xPercent: 14 + index * 3,
        rotate: 1.5,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 86%",
          once: true
        }
      })
    })
  }

  function initialiseDecisions() {
    if (reduceMotion) return

    gsap.utils.toArray(".lis-decision-row").forEach(row => {
      const solution = row.querySelector(".lis-decision-solution")
      const problem = row.querySelector(".lis-decision-problem")

      gsap.to(solution, {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top 82%",
          end: "center 46%",
          scrub: 0.75
        }
      })

      gsap.to(problem, {
        opacity: 0.72,
        x: -8,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top 58%",
          end: "center 40%",
          scrub: 0.65
        }
      })
    })
  }

  function initialiseDevices() {
    const stage = document.querySelector(".lis-device-stage")
    if (!stage || reduceMotion) return

    const devices = gsap.utils.toArray(".lis-device")

    gsap.from(devices, {
      y: 90,
      rotateX: 7,
      opacity: 0,
      duration: 1,
      stagger: 0.14,
      ease: "power3.out",
      scrollTrigger: {
        trigger: stage,
        start: "top 82%",
        once: true
      }
    })

    if (!window.matchMedia("(pointer: fine)").matches) return

    devices.forEach((device, index) => {
      device.addEventListener("pointerenter", () => {
        gsap.to(device, {
          y: -10,
          rotateX: -1.5,
          rotateY: (index - 1) * 1.5,
          duration: 0.55,
          ease: "power3.out"
        })
      })

      device.addEventListener("pointerleave", () => {
        gsap.to(device, {
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: "elastic.out(1,.55)"
        })
      })
    })
  }

  function initialiseCardsAndGallery() {
    if (reduceMotion) return

    gsap.from(".lis-feature-card", {
      y: 70,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-feature-grid",
        start: "top 82%",
        once: true
      }
    })

    gsap.from(".lis-learning-text p", {
      x: 50,
      opacity: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-learning-text",
        start: "top 78%",
        once: true
      }
    })

    gsap.from(".lis-outro-links a", {
      x: 45,
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lis-outro-links",
        start: "top 84%",
        once: true
      }
    })
  }

  function initialiseGallery() {
    if (reduceMotion) return

    const figures = Array.from(
      document.querySelectorAll(".lis-gallery-stage figure")
    )
    const notes = Array.from(
      document.querySelectorAll(".lis-gallery-notes article")
    )
    const counter = document.querySelector("#lis-gallery-current")
    let activeIndex = 0

    const activate = index => {
      if (
        index === activeIndex &&
        figures[index]?.classList.contains("is-active")
      ) return

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
        gsap.fromTo(next, {
          opacity: 0,
          scale: 1.055
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.72,
          ease: "power3.out"
        })
      }

      activeIndex = index
      if (counter) {
        counter.textContent = String(index + 1).padStart(2, "0")
      }
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

  function initialise() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      document.querySelector(".lis-entry")?.remove()
      const polaroidStage = document.querySelector(".lis-polaroid-stage")
      if (polaroidStage) polaroidStage.dataset.polaroidState = "error"
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    document.body.classList.add("lis-motion-ready")
    initialisePolaroidHero()
    initialiseEntry()
    initialiseHeroScroll()
    initialiseSectionMotion()
    initialisePromise()
    initialiseProcess()
    initialiseDecisions()
    initialiseDevices()
    initialiseGallery()
    initialiseCardsAndGallery()

    window.addEventListener("load", () => ScrollTrigger.refresh(), {
      once: true
    })

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    window.addEventListener("pagehide", () => polaroidController?.destroy(), {
      once: true
    })
  }

  document.addEventListener("DOMContentLoaded", initialise)
})()
