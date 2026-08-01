(function () {
  if (typeof gsap === "undefined") {
    document.querySelector(".preloader")?.remove();
    document.documentElement.classList.remove("is-loading");
    return;
  }

  const gsapPlugins = [ScrollTrigger, ScrollSmoother, SplitText];
  if (typeof DrawSVGPlugin !== "undefined") gsapPlugins.push(DrawSVGPlugin);
  gsap.registerPlugin(...gsapPlugins);

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
    gsap.set(".hero-title-outline", { opacity: 0 });
    tl.to(title.chars, { yPercent: 0, opacity: 1, duration: 1.25, stagger: .018 })
      .to(".hero-portrait-shell", { y: 0, opacity: 1, duration: 1.25 }, "-=.9")
      .to(".hero-title-outline", { opacity: 1, duration: .55 }, "-=.7")
      .from(".hero-kicker, .hero-bottom", { y: 24, opacity: 0, duration: .8, stagger: .15 }, "-=.65");
  }

  function preloader(smoother) {
    const loader = document.querySelector(".preloader");
    const resetToHero = () => {
      if (smoother) smoother.scrollTo(0, false);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetToHero();

    if (!loader || reduceMotion) {
      if (loader) loader.remove();
      document.documentElement.classList.remove("is-loading");
      if (smoother) smoother.paused(false);
      intro();
      return;
    }

    const counter = { value: 0 };
    const counterElement = loader.querySelector(".preloader-progress b");
    const mark = loader.querySelector(".preloader-mark img");
    const tl = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        resetToHero();
        document.documentElement.classList.remove("is-loading");
        if (smoother) smoother.paused(false);
        resetToHero();
        loader.remove();
        ScrollTrigger.refresh();
      }
    });

    gsap.set(mark, {
      xPercent: -7,
      scale: 1.14,
      clipPath: "inset(0 100% 0 0)",
      transformOrigin: "50% 50%"
    });
    gsap.set(".site-header", { yPercent: -105 });
    gsap.set(".rail, .hud", { opacity: 0 });

    tl.to(mark, {
      xPercent: 0,
      scale: 1,
      clipPath: "inset(0 0% 0 0)",
      duration: 1.05,
      ease: "expo.out"
    })
      .to(counter, {
        value: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          counterElement.textContent = String(Math.round(counter.value)).padStart(3, "0");
        }
      }, "-=.5")
      .to(".preloader-progress-line", {
        scaleX: 1,
        duration: 2.1,
        ease: "power2.inOut"
      }, "<")
      .to(".preloader-meta, .preloader-progress", {
        opacity: 0,
        y: -18,
        duration: .25
      })
      .to(mark, {
        scale: 1.7,
        opacity: 0,
        filter: "blur(10px)",
        duration: .6,
        ease: "power3.in"
      }, "-=.2")
      .call(intro, null, "-=.3")
      .to(".preloader-panel-top", {
        xPercent: -101,
        duration: .8
      }, "-=.25")
      .to(".preloader-panel-bottom", {
        xPercent: 101,
        duration: .8
      }, "<")
      .to(".site-header", {
        yPercent: 0,
        duration: .6,
        ease: "power3.out"
      }, "-=.6")
      .to(".rail, .hud", {
        opacity: 1,
        duration: .4,
        stagger: .08,
        ease: "power2.out"
      }, "-=.45");
  }

  function heroMotion() {
    if (reduceMotion) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
    tl.to(".hero-line-one", { xPercent: -12, opacity: .1, ease: "none" }, 0)
      .to(".hero-line-two", { xPercent: 12, opacity: .12, ease: "none" }, 0)
      .to(".hero-portrait-shell", { y: "18vh", ease: "none" }, 0)
      .to(".hero-portrait", { scale: 1.38, transformOrigin: "50% 58%", ease: "none" }, 0)
      .to(".hero-title-outline", { opacity: 0, duration: .18, ease: "none" }, 0)
      .to(".hero-bottom", { opacity: 0, y: -40, ease: "none" }, 0)
      .to(".hero-kicker", { opacity: 0, ease: "none" }, 0);
  }

  function heroAmbient() {
    const canvas = document.querySelector(".hero-ambient");
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power"
    });
    if (!gl) {
      canvas.classList.add("is-fallback");
      return;
    }

    const vertexSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 pointer;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        mat2 turn = mat2(0.82, -0.57, 0.57, 0.82);
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = turn * p * 2.03 + vec2(4.7, 2.9);
          amplitude *= 0.5;
        }
        return value;
      }

      float smoke(vec2 uv, vec2 centre, float seed) {
        vec2 p = uv - centre;
        float flow = time * 0.095;
        vec2 samplePoint = p * vec2(3.1, 2.05);

        vec2 firstWarp = vec2(
          fbm(samplePoint + vec2(seed, flow)),
          fbm(samplePoint + vec2(5.2 + seed, -flow * 0.72))
        ) - 0.5;
        vec2 secondWarp = vec2(
          fbm(samplePoint + firstWarp * 1.65 + vec2(flow * 0.5, seed)),
          fbm(samplePoint + firstWarp * 1.35 + vec2(seed + 8.4, -flow * 0.38))
        ) - 0.5;

        p += firstWarp * vec2(0.15, 0.11);
        p += secondWarp * vec2(0.085, 0.07);
        p.x += sin(p.y * 5.2 + flow * 1.8 + seed) * 0.035;

        float envelope = 1.0 - smoothstep(
          0.06,
          0.82,
          length(vec2(p.x * 2.15, p.y * 0.9))
        );
        float detail = fbm(
          p * vec2(6.4, 4.2) +
          firstWarp * 2.1 +
          vec2(seed, -flow * 0.7)
        );
        float wisps = smoothstep(0.31, 0.79, detail);
        float thinVeins = smoothstep(
          0.48,
          0.76,
          fbm(p * vec2(10.0, 6.1) - secondWarp * 1.8 + vec2(seed))
        );

        return envelope * (0.18 + wisps * 0.72 + thinVeins * 0.22);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv.y = 1.0 - uv.y;

        vec2 influence = (pointer - 0.5) * vec2(0.035, 0.02);
        float coralField = smoke(uv, vec2(0.27, 0.51) + influence, 1.7);
        float acidField = smoke(uv, vec2(0.73, 0.48) + influence, 7.3);
        float breath = 0.92 + sin(time * 0.42) * 0.08;

        vec3 coral = vec3(1.0, 0.36, 0.208);
        vec3 acid = vec3(0.847, 1.0, 0.243);
        vec3 colour = coral * coralField + acid * acidField;
        float horizontalFade =
          smoothstep(0.0, 0.14, uv.x) *
          (1.0 - smoothstep(0.86, 1.0, uv.x));
        float verticalFade =
          smoothstep(0.0, 0.12, uv.y) *
          (1.0 - smoothstep(0.68, 0.98, uv.y));
        float edgeFade = horizontalFade * verticalFade;
        float alpha = max(coralField, acidField) * 0.48 * breath * edgeFade;

        gl_FragColor = vec4(colour * alpha, alpha);
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      canvas.classList.add("is-fallback");
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.classList.add("is-fallback");
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "resolution");
    const time = gl.getUniformLocation(program, "time");
    const pointer = gl.getUniformLocation(program, "pointer");
    const pointerTarget = { x: 0.5, y: 0.5 };
    const pointerCurrent = { x: 0.5, y: 0.5 };
    let visible = true;
    let frame = 0;
    let start = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = now => {
      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.025;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.025;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, reduceMotion ? 0 : (now - start) / 1000);
      gl.uniform2f(pointer, pointerCurrent.x, pointerCurrent.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = visible && !reduceMotion ? requestAnimationFrame(render) : 0;
    };

    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !frame) {
        start = performance.now();
        frame = requestAnimationFrame(render);
      } else if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    if (finePointer) {
      window.addEventListener("pointermove", event => {
        pointerTarget.x = event.clientX / window.innerWidth;
        pointerTarget.y = 1 - event.clientY / window.innerHeight;
      }, { passive: true });
    }
    new ResizeObserver(resize).observe(canvas);
    observer.observe(canvas);
    resize();
    render(performance.now());
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

    const interlude = document.querySelector(".interlude");
    const interludeTrack = document.querySelector(".interlude-track");
    const interludeRouteSvg = document.querySelector(".interlude-route");
    const interludeRouteBase = document.querySelector(".interlude-route-base");
    const interludeRoute = document.querySelector(".interlude-route-progress");
    const sizeInterludeRoute = () => {
      if (!interlude || !interludeRouteSvg || !interludeRouteBase || !interludeRoute) return;
      const { width, height } = interludeRouteSvg.getBoundingClientRect();
      const route = [
        `M0 0`,
        `C${width * .09} ${height * .02} ${width * .16} ${height * .12} ${width * .23} ${height * .21}`,
        `C${width * .29} ${height * .3} ${width * .45} ${height * .33} ${width * .51} ${height * .14}`,
        `C${width * .58} ${height * -.04} ${width * .77} ${height * .02} ${width * .89} ${height * .2}`,
        `C${width} ${height * .37} ${width * .91} ${height * .6} ${width * .79} ${height * .72}`,
        `C${width * .67} ${height * .84} ${width * .5} ${height * .9} ${width * .37} ${height * .78}`,
        `C${width * .24} ${height * .66} ${width * .12} ${height * .8} 0 ${height}`
      ].join("");

      interludeRouteSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      interludeRouteBase.setAttribute("d", route);
      interludeRoute.setAttribute("d", route);
    };

    sizeInterludeRoute();

    const interludeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".interlude",
        start: "top top",
        end: "+=175%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefreshInit: sizeInterludeRoute
      }
    });
    const interludeSymbols = [
      ".symbol-cube",
      ".symbol-pointer",
      ".symbol-spark",
      ".symbol-squiggle",
      ".symbol-code"
    ];

    if (interludeRoute) {
      if (typeof DrawSVGPlugin !== "undefined") {
        gsap.set(interludeRoute, { drawSVG: 0 });
      } else {
        const routeLength = interludeRoute.getTotalLength();
        gsap.set(interludeRoute, {
          strokeDasharray: `${routeLength} ${routeLength}`,
          strokeDashoffset: routeLength
        });
      }
    }
    gsap.set(".interlude-symbol", {
      scale: .42,
      opacity: .1,
      transformOrigin: "50% 50%"
    });

    interludeTimeline
      .fromTo(".interlude-track", {
        x: 0
      }, {
        x: () => -Math.max(0, interludeTrack.scrollWidth - window.innerWidth),
        duration: 1,
        ease: "none"
      }, 0)
      .fromTo(".interlude-symbol", {
        xPercent: (index) => index % 2 ? 28 : -28,
        yPercent: (index) => index % 2 ? -10 : 10,
        rotation: (index) => index % 2 ? -18 : 18
      }, {
        xPercent: (index) => index % 2 ? -34 : 34,
        yPercent: (index) => index % 2 ? 16 : -16,
        rotation: (index) => index % 2 ? 42 : -42,
        duration: 1,
        ease: "none"
      }, 0);

    if (interludeRoute) {
      interludeTimeline.to(interludeRoute, typeof DrawSVGPlugin !== "undefined" ? {
        drawSVG: "100%",
        duration: 1,
        ease: "none"
      } : {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none"
      }, 0);
    }

    interludeSymbols.forEach((selector, index) => {
      const arrival = [.1, .26, .42, .68, .84][index];
      interludeTimeline
        .to(selector, {
          scale: 1.18,
          opacity: 1,
          filter: "drop-shadow(0 0 1.8rem var(--symbol-glow))",
          duration: .075,
          ease: "power3.out"
        }, arrival)
        .to(selector, {
          scale: 1,
          filter: "drop-shadow(0 0 .8rem var(--symbol-glow-rest))",
          duration: .08,
          ease: "power2.inOut"
        }, arrival + .075);
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

  function cursorTrail() {
    if (
      !finePointer ||
      reduceMotion ||
      !window.matchMedia("(min-width: 901px)").matches
    ) return;

    const canvas = document.querySelector(".cursor-trail");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const points = [];
    const lifetime = 520;
    const coral = [255, 92, 53];
    const paper = [238, 234, 225];
    const trailColour = [...coral];
    let trailTarget = coral;
    let frame;
    let lastPoint;

    const isCoralSurface = (x, y) => {
      const visited = new Set();
      for (const element of document.elementsFromPoint(x, y)) {
        let node = element;
        while (node && node !== document.documentElement) {
          if (visited.has(node)) break;
          visited.add(node);
          if (node.dataset?.cursorContrast === "paper") return true;
          const match = getComputedStyle(node).backgroundColor.match(
            /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/
          );
          if (match) {
            const alpha = match[4] === undefined ? 1 : Number(match[4]);
            if (alpha > .08) {
              const distance = Math.hypot(
                Number(match[1]) - coral[0],
                Number(match[2]) - coral[1],
                Number(match[3]) - coral[2]
              );
              return distance < 45;
            }
          }
          node = node.parentElement;
        }
      }
      return false;
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      while (points.length && time - points[0].time > lifetime) points.shift();

      context.lineCap = "round";
      context.lineJoin = "round";
      trailColour.forEach((value, index) => {
        trailColour[index] += (trailTarget[index] - value) * .14;
      });
      const colour = trailColour.map(value => Math.round(value)).join(", ");

      for (let index = 1; index < points.length; index += 1) {
        const point = points[index];
        const previous = points[index - 1];
        const life = Math.max(0, 1 - (time - point.time) / lifetime);

        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(${colour}, ${life * .64})`;
        context.lineWidth = .5 + life * 1.7;
        context.stroke();
      }

      frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", (event) => {
      const onCoral = isCoralSurface(event.clientX, event.clientY);
      trailTarget = onCoral ? paper : coral;
      document.body.classList.toggle("cursor-on-coral", onCoral);

      const nextPoint = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      };

      if (lastPoint) {
        const distance = Math.hypot(
          nextPoint.x - lastPoint.x,
          nextPoint.y - lastPoint.y
        );
        const steps = Math.min(5, Math.floor(distance / 12));

        for (let step = 1; step <= steps; step += 1) {
          const progress = step / (steps + 1);
          points.push({
            x: gsap.utils.interpolate(lastPoint.x, nextPoint.x, progress),
            y: gsap.utils.interpolate(lastPoint.y, nextPoint.y, progress),
            time: nextPoint.time
          });
        }
      }

      points.push(nextPoint);
      if (points.length > 70) points.splice(0, points.length - 70);
      lastPoint = nextPoint;
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      lastPoint = undefined;
      trailTarget = coral;
      document.body.classList.remove("cursor-on-coral");
    });

    window.addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(draw);

    window.addEventListener("pagehide", () => cancelAnimationFrame(frame), {
      once: true
    });
  }

  function navHovers() {
    if (!finePointer || reduceMotion) return;

    const animateRoll = (link, button = false) => {
      const first = link.querySelector(".nav-roll-primary");
      const second = link.querySelector(".nav-roll-secondary");
      if (!first || !second) return;

      const firstSplit = new SplitText(first, { type: "chars" });
      const secondSplit = new SplitText(second, { type: "chars" });
      gsap.set(secondSplit.chars, { yPercent: 145 });
      gsap.set(second, { visibility: "visible" });

      link.addEventListener("pointerenter", () => {
        gsap.to(firstSplit.chars, { yPercent: -145, duration: button ? .55 : .4, stagger: button ? .045 : .025, ease: "power3.inOut" });
        gsap.to(secondSplit.chars, { yPercent: 0, duration: button ? .55 : .4, stagger: button ? .045 : .025, ease: "power3.inOut" });
        if (button) {
          gsap.to(".site-header", { "--cta-inset": "5px", duration: .55, ease: "power3.inOut" });
        } else {
          gsap.to(link, { "--dot-position": "-1rem", "--dot-opacity": 1, duration: .4, ease: "power3.inOut" });
        }
      });

      link.addEventListener("pointerleave", () => {
        gsap.to(firstSplit.chars, { yPercent: 0, duration: button ? .55 : .4, stagger: .02, ease: "power3.inOut" });
        gsap.to(secondSplit.chars, { yPercent: 145, duration: button ? .55 : .4, stagger: .02, ease: "power3.inOut" });
        if (button) {
          gsap.to(".site-header", { "--cta-inset": "0px", duration: .55, ease: "power3.inOut" });
        } else {
          gsap.to(link, { "--dot-position": "-1.4rem", "--dot-opacity": 0, duration: .4, ease: "power3.inOut" });
        }
      });
    };

    document.querySelectorAll(".desktop-nav .nav-roll").forEach(link => animateRoll(link));
    const cta = document.querySelector(".nav-cta");
    if (cta) animateRoll(cta, true);
  }

  window.addEventListener("load", () => {
    const smoother = initSmoother();
    if (smoother) smoother.paused(true);
    preloader(smoother);
    heroAmbient();
    heroMotion();
    sectionReveals();
    hud();
    magnetic();
    cursorTrail();
    navHovers();
    ScrollTrigger.refresh();
  });
})();
