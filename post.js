(function () {
  const API_URL =
    "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master"
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

  const formatDate = date =>
    date
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }).format(new Date(date))
      : "Date pending"

  async function fetchPostBySlug(slug) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetPostBySlug($slug: String!) {
            post(where: { slug: $slug }) {
              title
              content { html }
              coverImage { url }
              publishedDate
              updatedDate
              category { name }
              author { name }
            }
          }
        `,
        variables: { slug }
      })
    })

    if (!response.ok) throw new Error("The article did not answer")
    const payload = await response.json()
    if (payload.errors?.length) throw new Error(payload.errors[0].message)
    return payload.data.post
  }

  function categoriesMarkup(categories = []) {
    if (!categories.length) return ""
    return `
      <div class="article-categories" aria-label="Article categories">
        ${categories.map(category =>
          `<span>${escapeHTML(category.name)}</span>`
        ).join("")}
      </div>
    `
  }

  function articleMarkup(post) {
    const author = post.author?.[0] || post.author
    const cover = escapeHTML(post.coverImage?.url || "./assets/images/blogging.webp")
    const title = escapeHTML(post.title)
    const authorName = escapeHTML(author?.name || "Rodrigo De Lascio")

    return `
      <article class="post">
        <header class="article-hero">
          <div class="article-hero-meta">
            <a href="./blog.html">02 / WRITING</a>
            <span>Filed under, things I learned the hard way</span>
          </div>

          <div class="article-heading">
            <p>Dispatch from the debugging department</p>
            <h1>${title}</h1>
          </div>

          <div class="article-cover">
            <img src="${cover}" alt="${title}">
            <span class="article-cover-index">READ / THINK / REPEAT</span>
          </div>

          <div class="article-intro">
            <dl>
              <div><dt>Published</dt><dd>${formatDate(post.publishedDate)}</dd></div>
              ${post.updatedDate
                ? `<div><dt>Updated</dt><dd>${formatDate(post.updatedDate)}</dd></div>`
                : ""}
              <div><dt>Reading time</dt><dd data-reading-time>Calculating</dd></div>
              <div class="article-author">
                <dt>Written by</dt>
                <dd>${authorName}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div class="article-body-wrap">
          <aside class="article-aside">
            <span>ARTICLE NOTES</span>
            ${categoriesMarkup(post.category)}
            <a href="./blog.html">← All writing</a>
          </aside>
          <div class="post-content">${post.content?.html || ""}</div>
        </div>

        <a class="article-back-strip" href="./blog.html">
          <span>Finished this one?</span>
          <strong>BACK TO THE ARCHIVE</strong>
          <i>↗</i>
        </a>
      </article>
    `
  }

  function updateReadingTime() {
    const content = document.querySelector(".post-content")
    const output = document.querySelector("[data-reading-time]")
    if (!content || !output) return
    const words = content.textContent.trim().split(/\s+/).filter(Boolean).length
    output.textContent = `${Math.max(1, Math.ceil(words / 220))} min read`
  }

  function cleanArticlePunctuation() {
    const content = document.querySelector(".post-content")
    if (!content) return
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      if (!node.parentElement?.closest("pre, code")) {
        node.nodeValue = node.nodeValue.replace(/[—–;]/g, ",")
      }
      node = walker.nextNode()
    }
  }

  function initialiseProgress() {
    const bar = document.querySelector(".reading-progress span")
    const content = document.querySelector(".post-content")
    if (!bar || !content) return

    const update = () => {
      const start = content.getBoundingClientRect().top + window.scrollY
      const end = start + content.offsetHeight - window.innerHeight
      const progress = end > start
        ? Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)))
        : 0
      bar.style.transform = `scaleX(${progress})`
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
  }

  function initialiseArticleMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    gsap.registerPlugin(ScrollTrigger, SplitText)
    const title = new SplitText(".article-heading h1", { type: "lines" })
    const timeline = gsap.timeline()
    timeline
      .from(".article-hero-meta, .article-heading > p", {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08
      })
      .from(title.lines, {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power4.out"
      }, "-=0.3")
      .from(".article-cover", {
        clipPath: "inset(0 0 100% 0)",
        duration: 1,
        ease: "power3.inOut"
      }, "-=0.55")
      .from(".article-intro", {
        y: 35,
        opacity: 0,
        duration: 0.7
      }, "-=0.4")

    document.querySelectorAll(".post-content > *").forEach(element => {
      gsap.from(element, {
        y: 28,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 91%",
          once: true
        }
      })
    })
    ScrollTrigger.refresh()
  }

  function renderError(message) {
    document.querySelector(".post-container").innerHTML = `
      <div class="post-error">
        <span>404 / ISH</span>
        <h1>THIS ARTICLE<br><strong>WANDERED OFF.</strong></h1>
        <p>${escapeHTML(message)}</p>
        <a href="./blog.html">Back to the archive ↗</a>
      </div>
    `
  }

  async function renderPost() {
    const slug = new URLSearchParams(window.location.search).get("slug")
    if (!slug) {
      renderError("No article was selected. Very mysterious.")
      return
    }

    try {
      const post = await fetchPostBySlug(slug)
      if (!post) {
        renderError("It may have moved, or it may be avoiding responsibility.")
        return
      }

      document.title = `${post.title} | Rodrigo De Lascio`
      document.querySelector(".post-container").innerHTML = articleMarkup(post)
      cleanArticlePunctuation()
      updateReadingTime()
      initialiseProgress()
      initialiseArticleMotion()
    } catch (error) {
      renderError("The filing cabinet is stuck. Please try again in a moment.")
    }
  }

  renderPost()
})()
