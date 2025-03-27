const API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm7f4o97y012007waqcbs2n5z/master";

async function fetchPostBySlug(slug) {
  const query = `
      query GetPostBySlug($slug: String!) {
        post(where: { slug: $slug }) {
          title
          content {
            html
          }
          coverImage {
            url
          }
          publishedDate
          updatedDate
          excerpt
          featured
          category {
            name
          }
          author {
            name
            picture {
              url
            }
          }
        }
      }
    `;

  const variables = { slug };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data } = await response.json();
  return data.post;
}

async function renderPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.querySelector(".post-container").innerHTML =
      "<p>Post not found.</p>";
    return;
  }

  const post = await fetchPostBySlug(slug);

  if (post) {
    document.title = `${post.title} | Rodrigo De Lascio | Full-Stack Developer`;

    const author = post.author?.[0];

    document.querySelector(".post-container").innerHTML = `
        <div class="post">
          <img src="${post.coverImage.url}" alt="${post.title}">
          <h1>${post.title}</h1>
          <div class="post-details-container">
          <div class="post-published-updated-wrapper">
          <p><strong>Published on:</strong> ${new Date(
            post.publishedDate
          ).toLocaleDateString()}</p>
          ${
            post.updatedDate
              ? `<p><strong>Updated on:</strong> ${new Date(
                  post.updatedDate
                ).toLocaleDateString()}</p>`
              : ""
          }
          </div>
          ${
            author
              ? `
                <div class="author">
                  <p><strong>Author:</strong> ${author.name}</p>
                  <img src="${author.picture?.url}" alt="${author.name}">
                </div>
              `
              : "<p><strong>Author:</strong> Unknown</p>"
          }       
                    </div>
          <div class="post-content">${post.content.html}</div>
          ${
            post.category?.length
              ? `<div class="categories-container">
                    <p><strong>Categories:</strong> ${post.category
                      .map((cat) => cat.name)
                      .join(", ")}</p>
                 </div>`
              : ""
          }
        </div>
      `;
  } else {
    document.querySelector(".post-container").innerHTML =
      "<p>Post not found.</p>";
  }
}

renderPost();
