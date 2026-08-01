const landingBlogApi =
  "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master"

const landingBlogQuery = `
  query LatestLandingPosts {
    posts(first: 3, orderBy: publishedDate_DESC) {
      title
      slug
      excerpt
      publishedDate
      coverImage {
        url
      }
    }
  }
`

function formatLandingPostDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date))
}

function shortenLandingExcerpt(excerpt, length = 180) {
  if (excerpt.length <= length) return excerpt
  return `${excerpt.slice(0, length).trimEnd()}...`
}

function cleanLandingText(value) {
  return value.replace(/[—–;]/g, ",")
}

async function updateLandingBlog() {
  const cards = [...document.querySelectorAll("[data-blog-card]")]
  if (!cards.length) return

  try {
    const response = await fetch(landingBlogApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: landingBlogQuery })
    })

    if (!response.ok) return

    const result = await response.json()
    const posts = result?.data?.posts
    if (!posts?.length) return

    cards.forEach((card, index) => {
      const post = posts[index]
      if (!post) return

      card.href = `./post.html?slug=${encodeURIComponent(post.slug)}`

      const date = card.querySelector(".article-meta span:first-child")
      const title = card.querySelector("h3")
      const excerpt = card.querySelector("p")
      const image = card.querySelector(".article-image img")

      if (date) date.textContent = formatLandingPostDate(post.publishedDate)
      if (title) title.textContent = cleanLandingText(post.title)
      if (excerpt) {
        excerpt.textContent = cleanLandingText(
          shortenLandingExcerpt(post.excerpt)
        )
      }
      if (image && post.coverImage?.url) {
        image.src = post.coverImage.url
        image.alt = `${cleanLandingText(post.title)} article cover`
      }
    })

    window.ScrollTrigger?.refresh()
  } catch {
    // The published cards in the HTML remain available as a quiet fallback.
  }
}

updateLandingBlog()
