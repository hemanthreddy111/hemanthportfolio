/* Lenis smooth scrolling + GSAP ScrollTrigger registration */
// ----------------------------------------------------
// 2. Smooth Scrolling Setup (Lenis)
// ----------------------------------------------------
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    wheelMultiplier: 1.0,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000) });
gsap.ticker.lagSmoothing(0, 0);

gsap.registerPlugin(ScrollTrigger);
