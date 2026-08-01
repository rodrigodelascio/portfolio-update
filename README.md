# Rodrigo de Lascio, portfolio

A motion-led portfolio for my work, writing, and background as a full-stack developer. The site is built with semantic HTML, modern CSS, and vanilla JavaScript, with GSAP and Three.js used for the richer interactions.

## What is included

- A responsive landing page with an animated hero, pinned project gallery, live writing feed, and custom cursor
- Dedicated work, writing, about, and article pages
- Detailed RodFlix and Let It Shine case studies
- Scroll-based motion using GSAP, ScrollTrigger, ScrollSmoother, SplitText, and DrawSVG
- Interactive 3D scenes built with Three.js and GLTF models
- Blog content fetched from Hygraph through its GraphQL API
- Reduced-motion fallbacks and keyboard-friendly navigation

## Technology

- HTML5
- CSS3 with custom properties, responsive layouts, and container-aware sizing
- Vanilla JavaScript
- GSAP and its ScrollTrigger, ScrollSmoother, SplitText, and DrawSVG plugins
- Three.js with GLTF assets
- Hygraph for article content

There is no bundler or build step. Browser dependencies are loaded from a CDN.

## Run locally

Serve the repository through a local HTTP server so that modules, models, and media load correctly.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Project structure

```text
.
├── index.html, style.css, animations.js
├── about.html, about.css, about.js
├── blog.html, blog.css, blog.js
├── post.html, post.css, post.js
├── work.html, work.css, work.js
├── interior.css, interior.js
├── landing-blog.js
├── work/
│   ├── rodflix.html, rodflix.css, rodflix.js
│   └── let-it-shine.html, let-it-shine.css, let-it-shine.js
└── assets/
    ├── images/
    ├── models/
    └── videos/
```

`interior.css` and `interior.js` contain the shared navigation, footer, cursor, status display, and common interactions used by the interior pages. Each page keeps its own layout and motion code alongside its HTML.

## Live site

[rodrigodelascio.co.uk](https://rodrigodelascio.co.uk/)

## Author

- [GitHub](https://github.com/rodrigodelascio)
- [LinkedIn](https://www.linkedin.com/in/rodrigo-de-lascio/)
