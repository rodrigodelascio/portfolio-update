const API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master";
const POSTS_PER_PAGE = 5;

function getPostsPerPage(page) {
  return page === 1 ? 5 : 6;
}

async function fetchPosts(page = 1) {
  const postsPerPage = getPostsPerPage(page);
  const offset = page === 1 ? 0 : 5 + (page - 2) * 6;
  const query = `
    query GetPosts($first: Int, $skip: Int) {
      posts(first: $first, skip: $skip, orderBy: publishedDate_DESC) {
        title
        slug
        excerpt
        coverImage {
          url
        }
        publishedDate
        featured
      }
    }
  `;

  const variables = {
    first: postsPerPage,
    skip: offset,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data } = await response.json();
  return data.posts;
}

async function renderPosts(page = 1) {
  const posts = await fetchPosts(page);
  const blogContainer = document.querySelector(".blog-container");
  blogContainer.innerHTML = "";

  if (posts.length > 0) {
    if (page === 1) {
      const featuredPost = posts.find((post) => post.featured);
      if (featuredPost) {
        blogContainer.innerHTML += `
            <a href="post.html?slug=${featuredPost.slug}" class="post-link">
            <div class="featured-post">
              <img src="${featuredPost.coverImage.url}" alt="${featuredPost.title}">
              <h2>${featuredPost.title}</h2>
              <p>${featuredPost.excerpt}</p>
              <i class="fa-solid fa-up-right-from-square"></i>
            </div>
            </a>
          `;
      }
      const gridPosts = posts.filter((post) => !post.featured);
      if (gridPosts.length > 0) {
        const gridHTML = gridPosts
          .map(
            (post) => `
            <a href="post.html?slug=${post.slug}" class="post-link">
              <div class="grid-post">
                <img src="${post.coverImage.url}" alt="${post.title}">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <i class="fa-solid fa-up-right-from-square"></i>
              </div>
            </a>
            `
          )
          .join("");
        blogContainer.innerHTML += `<div class="grid-container">${gridHTML}</div>`;
      }
    } else {
      // No featured post on other pages
      const gridHTML = posts
        .map(
          (post) => `
          <a href="post.html?slug=${post.slug}" class="post-link">
            <div class="grid-post">
              <img src="${post.coverImage.url}" alt="${post.title}">
              <h3>${post.title}</h3>
              <p>${post.excerpt}</p>
              <i class="fa-solid fa-up-right-from-square"></i>
            </div>
          </a>
          `
        )
        .join("");
      blogContainer.innerHTML += `<div class="grid-container">${gridHTML}</div>`;
    }
  }

  renderPagination(page);
}

async function renderPagination(currentPage) {
  const totalPosts = await fetchTotalPosts();
  // First page: 5 posts, subsequent pages: 6 posts each
  const totalPages = totalPosts <= 5 ? 1 : 1 + Math.ceil((totalPosts - 5) / 6);

  const paginationContainer = document.querySelector(".pagination-container");
  paginationContainer.innerHTML = `
      <button ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${
    currentPage - 1
  })">Previous</button>
      <button ${
        currentPage >= totalPages ? "disabled" : ""
      } onclick="changePage(${currentPage + 1})">Next</button>
    `;
}

async function fetchTotalPosts() {
  const query = `
      query {
        postsConnection {
          aggregate {
            count
          }
        }
      }
    `;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data.postsConnection.aggregate.count;
}

function changePage(page) {
  renderPosts(page);
}

renderPosts();
