(function () {
  const API_URL =
    "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function setMeta(attribute, key, content) {
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute(attribute, key)
      document.head.append(meta)
    }
    meta.content = content
  }

  function setCanonical(href) {
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.append(canonical)
    }
    canonical.href = href
  }

  function plainText(html = "") {
    const container = document.createElement("div")
    container.innerHTML = html
    return container.textContent.replace(/\s+/g, " ").trim()
  }

  function conciseDescription(value, limit = 160) {
    const description = String(value || "").replace(/\s+/g, " ").trim()
    if (description.length <= limit) return description
    return `${description.slice(0, limit - 3).trimEnd()}...`
  }

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
              excerpt
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
            <img src="${cover}" alt="${title} article cover">
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
            <a href="./blog.html">←︎ All writing</a>
          </aside>
          <div class="post-content">${post.content?.html || ""}</div>
        </div>

        <a class="article-back-strip" href="./blog.html">
          <span>Finished this one?</span>
          <strong>BACK TO THE ARCHIVE</strong>
          <i>↗︎</i>
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

  function auditArticleImages(title) {
    document.querySelectorAll(".post-content img").forEach((image, index) => {
      if (!image.getAttribute("alt")?.trim()) {
        const caption = image.closest("figure")?.querySelector("figcaption")
        image.alt = caption?.textContent.trim() ||
          `${title} article illustration ${index + 1}`
      }
      image.loading = "lazy"
      image.decoding = "async"
    })
  }

  function updateArticleSEO(post, slug) {
    const author = post.author?.[0] || post.author
    const authorName = author?.name || "Rodrigo De Lascio"
    const canonicalURL =
      `https://rodrigodelascio.co.uk/post.html?slug=${encodeURIComponent(slug)}`
    const imageURL = new URL(
      post.coverImage?.url || "./assets/images/blogging.webp",
      window.location.href
    ).href
    const description = conciseDescription(
      post.excerpt || plainText(post.content?.html) ||
        "Development, career detours, and useful things learned the hard way."
    )
    const imageAlt = `${post.title} article cover`
    const categories = (post.category || []).map(category => category.name)

    document.title = `${post.title} | Rodrigo De Lascio`
    setCanonical(canonicalURL)
    setMeta("name", "description", description)
    setMeta("name", "robots", "index, follow, max-image-preview:large")
    setMeta("property", "og:title", post.title)
    setMeta("property", "og:description", description)
    setMeta("property", "og:url", canonicalURL)
    setMeta("property", "og:image", imageURL)
    setMeta("property", "og:image:alt", imageAlt)
    setMeta("name", "twitter:title", post.title)
    setMeta("name", "twitter:description", description)
    setMeta("name", "twitter:image", imageURL)
    setMeta("name", "twitter:image:alt", imageAlt)

    if (post.publishedDate) {
      setMeta(
        "property",
        "article:published_time",
        new Date(post.publishedDate).toISOString()
      )
    }
    if (post.updatedDate) {
      setMeta(
        "property",
        "article:modified_time",
        new Date(post.updatedDate).toISOString()
      )
    }
    if (categories.length) {
      setMeta("property", "article:section", categories.join(", "))
    }

    let structuredData = document.getElementById("article-structured-data")
    if (!structuredData) {
      structuredData = document.createElement("script")
      structuredData.id = "article-structured-data"
      structuredData.type = "application/ld+json"
      document.head.append(structuredData)
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalURL}#article`,
      mainEntityOfPage: canonicalURL,
      headline: post.title,
      description,
      image: imageURL,
      datePublished: post.publishedDate || undefined,
      dateModified: post.updatedDate || post.publishedDate || undefined,
      inLanguage: "en-GB",
      author: {
        "@type": "Person",
        "@id": "https://rodrigodelascio.co.uk/#person",
        name: authorName,
        url: "https://rodrigodelascio.co.uk/"
      },
      publisher: {
        "@id": "https://rodrigodelascio.co.uk/#person"
      },
      keywords: categories.length ? categories : undefined
    })
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
    setMeta("name", "robots", "noindex, follow")
    document.querySelector(".post-container").innerHTML = `
      <div class="post-error">
        <span>404 / ISH</span>
        <h1>THIS ARTICLE<br><strong>WANDERED OFF.</strong></h1>
        <p>${escapeHTML(message)}</p>
        <a href="./blog.html">Back to the archive ↗︎</a>
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

      document.querySelector(".post-container").innerHTML = articleMarkup(post)
      updateArticleSEO(post, slug)
      cleanArticlePunctuation()
      auditArticleImages(post.title)
      updateReadingTime()
      initialiseProgress()
      initialiseArticleMotion()
    } catch (error) {
      renderError("The filing cabinet is stuck. Please try again in a moment.")
    }
  }

  renderPost()
})()
