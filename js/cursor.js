/* Custom cursor (dot + ring) — runs first; other scripts read mouseX/targetX etc. */
// ----------------------------------------------------
// 1. Setup Custom Cursor with Magnetic & Interaction Lerp
// ----------------------------------------------------
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let targetX = mouseX;
let targetY = mouseY;
let isHovered = false;
let portraitBaseY = 0;
let imageAspectRatio = 3.0 / 4.0;

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

// Add hover classes
const hoverTargets = document.querySelectorAll('.hover-target, a, button, .tech-icon');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
        isHovered = true;
        gsap.to(cursorRing, {
            width: 60,
            height: 60,
            borderColor: 'rgba(255, 45, 32, 1)',
            backgroundColor: 'rgba(255, 45, 32, 0.05)',
            duration: 0.3
        });
        gsap.to(cursorDot, {
            scale: 2,
            duration: 0.2
        });
    });
    el.addEventListener('mouseleave', () => {
        isHovered = false;
        gsap.to(cursorRing, {
            width: 30,
            height: 30,
            borderColor: 'rgba(255, 45, 32, 0.4)',
            backgroundColor: 'rgba(255, 45, 32, 0)',
            duration: 0.3
        });
        gsap.to(cursorDot, {
            scale: 1,
            duration: 0.2
        });
    });
});
