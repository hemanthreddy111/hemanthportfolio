# Hemanth Reddy — Cybersecurity Portfolio

Open `index.html` in a browser (needs internet for fonts + the CDN libraries).

## Structure
```
index.html              page content (text, links, sections)
css/styles.css          all styling
js/textures.js          AUTO-GENERATED base64 of the two portraits (see below)
js/cursor.js            custom cursor
js/smooth-scroll.js     Lenis smooth scrolling
js/hero-webgl.js        hero: 3D portrait, color reveal, fog, particles
js/animations.js        GSAP scroll animations for every section
assets/img/             portrait-bw.png, portrait-color.png (transparent cutouts)
assets/img/projects/    project illustrations (SVG) — replace with real screenshots
tools/build-textures.js rebuilds js/textures.js
```

## Things to update (search for these in index.html)
- `your-email@example.com` — your real email (appears twice)
- `github.com/knagahemanthreddy` and `linkedin.com/in/knagahemanthreddy` — confirm these URLs
- Project descriptions — written from the project names; edit to match what you built
- Project images — drop screenshots into `assets/img/projects/` and update the `<img src>`

## Changing the photo
1. Replace `assets/img/portrait-color.png` and `assets/img/portrait-bw.png`
   (same size, same framing, transparent background; B&W is the grayscale of the color one).
2. Run `node tools/build-textures.js`
