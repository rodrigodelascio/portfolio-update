(function () {
  const API_URL =
    "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master"
  const PAGE_SIZE = 6
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let totalPostsCache

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

  const formatDate = date => {
    if (!date) return "Date pending"
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(date))
  }

  const pageOffset = page => (page - 1) * PAGE_SIZE
  const totalPagesFor = total => Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function request(query, variables = {}) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) throw new Error("The article archive did not answer")
    const payload = await response.json()
    if (payload.errors?.length) throw new Error(payload.errors[0].message)
    return payload.data
  }

  async function fetchPosts(page) {
    const query = `
      query GetPosts($first: Int, $skip: Int) {
        posts(first: $first, skip: $skip, orderBy: publishedDate_DESC) {
          title
          slug
          excerpt
          coverImage { url }
          publishedDate
        }
      }
    `
    const data = await request(query, {
      first: PAGE_SIZE,
      skip: pageOffset(page)
    })
    return data.posts
  }

  async function fetchTotalPosts() {
    if (typeof totalPostsCache === "number") return totalPostsCache
    const data = await request(`
      query {
        postsConnection {
          aggregate { count }
        }
      }
    `)
    totalPostsCache = data.postsConnection.aggregate.count
    return totalPostsCache
  }

  function postImage(post) {
    const url = escapeHTML(post.coverImage?.url || "./assets/images/blogging.webp")
    const alt = escapeHTML(post.title)
    return `<img src="${url}" alt="${alt}" loading="lazy">`
  }

  function rowMarkup(post, index, offset) {
    return `
      <a class="article-row" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <span class="article-number">${String(offset + index + 1).padStart(2, "0")}</span>
        <div class="article-row-media">
          ${postImage(post)}
        </div>
        <div class="article-row-copy">
          <div class="article-meta">
            <span>${escapeHTML(formatDate(post.publishedDate))}</span>
            <span>Article</span>
          </div>
          <h3>${escapeHTML(post.title)}</h3>
          <p>${escapeHTML(post.excerpt)}</p>
          <span class="article-read"><span>Read article</span><i>↗</i></span>
        </div>
      </a>
    `
  }

  function pageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
    const values = new Set([1, total, current - 1, current, current + 1])
    const pages = [...values].filter(page => page > 0 && page <= total).sort((a, b) => a - b)
    const result = []
    pages.forEach((page, index) => {
      if (index && page - pages[index - 1] > 1) result.push("ellipsis")
      result.push(page)
    })
    return result
  }

  function renderPagination(currentPage, totalPages, totalPosts) {
    const container = document.querySelector(".pagination-container")
    const pages = pageNumbers(currentPage, totalPages)
      .map(page => page === "ellipsis"
        ? `<span class="pagination-ellipsis">•••</span>`
        : `
          <button
            type="button"
            data-page="${page}"
            ${page === currentPage ? 'aria-current="page"' : ""}
            aria-label="Go to page ${page}"
          >${String(page).padStart(2, "0")}</button>
        `)
      .join("")

    container.innerHTML = `
      <button
        type="button"
        class="pagination-direction"
        data-page="${currentPage - 1}"
        ${currentPage === 1 ? "disabled" : ""}
      >← Previous</button>
      <div class="pagination-summary">
        <span>Current page</span>
        <strong>${String(currentPage).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}</strong>
        <small>${totalPosts} article${totalPosts === 1 ? "" : "s"} total</small>
      </div>
      <div class="pagination-pages">${pages}</div>
      <button
        type="button"
        class="pagination-direction"
        data-page="${currentPage + 1}"
        ${currentPage === totalPages ? "disabled" : ""}
      >Next →</button>
    `

    container.querySelectorAll("button[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.disabled) return
        navigateToPage(Number(button.dataset.page))
      })
    })
  }

  function animateArticles() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) return

    document.querySelectorAll(".article-row").forEach((row, index) => {
      gsap.from(row, {
        y: 55,
        opacity: 0,
        duration: 0.75,
        delay: Math.min(index * 0.06, 0.25),
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 92%",
          once: true
        }
      })
    })
    ScrollTrigger.refresh()
  }

  async function renderPosts(page, options = {}) {
    const container = document.querySelector(".blog-container")
    const resultCount = document.getElementById("blog-result-count")
    container.setAttribute("aria-busy", "true")
    container.innerHTML = `
      <div class="blog-loading">
        <span>Checking the filing cabinet</span>
        <i></i>
      </div>
    `

    try {
      const [posts, totalPosts] = await Promise.all([
        fetchPosts(page),
        fetchTotalPosts()
      ])
      const totalPages = totalPagesFor(totalPosts)
      const safePage = Math.min(Math.max(page, 1), totalPages)

      if (safePage !== page) {
        navigateToPage(safePage, { replace: true })
        return
      }

      container.innerHTML = `
        ${posts.length
          ? `<div class="article-list">${posts.map((post, index) =>
              rowMarkup(post, index, pageOffset(page))
            ).join("")}</div>`
          : `
            <div class="blog-error">
              <strong>Nothing filed here yet.</strong>
              <p>This page is suspiciously tidy. Try another one.</p>
            </div>
          `}
      `
      container.removeAttribute("aria-busy")
      resultCount.textContent =
        `${totalPosts} article${totalPosts === 1 ? "" : "s"} in the archive`
      renderPagination(page, totalPages, totalPosts)
      animateArticles()

      if (options.scroll) {
        document.getElementById("article-archive").scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        })
      }
    } catch (error) {
      container.removeAttribute("aria-busy")
      resultCount.textContent = "The archive is taking an unscheduled break"
      container.innerHTML = `
        <div class="blog-error">
          <strong>The filing cabinet is stuck.</strong>
          <p>Please try again in a moment. It is probably thinking about its life choices.</p>
        </div>
      `
      document.querySelector(".pagination-container").innerHTML = ""
    }
  }

  function navigateToPage(page, options = {}) {
    const url = new URL(window.location.href)
    if (page === 1) url.searchParams.delete("page")
    else url.searchParams.set("page", page)

    if (options.replace) history.replaceState({ page }, "", url)
    else history.pushState({ page }, "", url)
    renderPosts(page, { scroll: !options.replace })
  }

  function initialiseHeroMotion() {
    if (
      reduceMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) return

    gsap.registerPlugin(ScrollTrigger, SplitText)
    const title = new SplitText(".writing-title", { type: "chars" })
    const heroTimeline = gsap.timeline()
    gsap.set(title.chars, { yPercent: 115, opacity: 0 })
    gsap.set(".writing-hero-meta, .writing-hero-bottom", {
      y: 20,
      opacity: 0
    })
    gsap.set(".writing-marquee", { opacity: 0 })

    heroTimeline
      .fromTo(".writing-hero", {
        clipPath: "circle(0% at 68% 47%)"
      }, {
        clipPath: "circle(150% at 68% 47%)",
        duration: 1.35,
        ease: "power4.inOut"
      })
      .from(".writing-orbits span", {
        scale: index => 4.5 - index * 0.8,
        rotate: index => index % 2 ? 42 : -38,
        opacity: 0,
        duration: 1.4,
        stagger: 0.08,
        ease: "power4.out"
      }, 0.1)
      .to(title.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.016,
        ease: "power4.out"
      }, 0.62)
      .to(".writing-marquee", {
        opacity: 0.11,
        duration: 0.65,
        ease: "power2.out"
      }, 0.95)
      .to(".writing-hero-meta, .writing-hero-bottom", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out"
      }, 1.02)
      .set(".writing-hero", { clearProps: "clipPath" })

    heroTimeline.eventCallback("onComplete", () => {
      gsap.fromTo(".writing-orbits span", {
        scale: 1,
        rotate: 0
      }, {
        scale: index => 1.22 + index * 0.08,
        rotate: index => index % 2 ? -14 : 12,
        xPercent: index => 7 + index * 3,
        yPercent: index => -5 - index * 2,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".writing-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      })
    })

    gsap.from(".archive-heading h2, .archive-heading > p", {
      y: 70,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".archive-heading",
        start: "top 80%",
        once: true
      }
    })
  }

  document.addEventListener("DOMContentLoaded", () => {
    initialiseHeroMotion()
    const initialPage = Math.max(
      1,
      Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10) || 1
    )
    history.replaceState({ page: initialPage }, "", window.location.href)
    renderPosts(initialPage)

    window.addEventListener("popstate", event => {
      const page = event.state?.page ||
        Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10) ||
        1
      renderPosts(page, { scroll: true })
    })
  })
})()
