/* GSAP scroll animations for every section */
// ----------------------------------------------------
// 11. GSAP Scroll Trigger Animations
// ----------------------------------------------------
// Typography letter splitting
const splitText = new SplitType('.hero-name-heading span', { types: 'chars' });

// Animate typography letter entry on page load
gsap.from('.hero-name-heading .char', {
    y: "100%",
    opacity: 0,
    duration: 1.2,
    stagger: 0.03,
    ease: "power4.out",
    delay: 0.4,
    clearProps: "transform,opacity"
});

// Typography break apart scroll parallax (outline moves left, fill moves right)
gsap.to('.hero-name-heading .outline', {
    x: -120,
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});
gsap.to('.hero-name-heading .fill', {
    x: 120,
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// Fade typography on scroll out
gsap.to('.hero-name-heading', {
    opacity: 0,
    scale: 0.9,
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '60% top',
        scrub: true
    }
});

// Fade in UI cards and header elements on page load
gsap.from('.hero-info-card', {
    x: -40,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.8
});
gsap.from('.hero-social-pills', {
    x: 40,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.8
});
gsap.from('.nav-container', {
    y: -20,
    opacity: 0,
    duration: 1.0,
    ease: "power3.out",
    delay: 0.2
});

// ----------------------------------------------------
// 13. Page Content Scroll Interactions (Lenis-linked)
// ----------------------------------------------------

// Manifesto revealing words
const manifestoSplit = new SplitType('.manifesto-text', { types: 'words' });
gsap.from(manifestoSplit.words, {
    opacity: 0.12,
    stagger: 0.08,
    scrollTrigger: {
        trigger: ".manifesto-sec",
        start: "top 75%",
        end: "center center",
        scrub: 1
    }
});

manifestoSplit.words.forEach(word => {
    gsap.to(word, {
        color: '#ffffff',
        scrollTrigger: {
            trigger: word,
            start: "top 72%",
            end: "top 50%",
            scrub: true
        }
    });
});

// About section slide trigger
gsap.fromTo('.about-portrait', 
    { scale: 1.15 },
    { 
        scale: 1, 
        scrollTrigger: { 
            trigger: ".about-sec", 
            start: "top bottom", 
            end: "top top", 
            scrub: true 
        }
    }
);

// Projects Stack pin trigger
const projects = gsap.utils.toArray('.project-panel');
projects.forEach((panel) => {
    ScrollTrigger.create({
        trigger: panel,
        start: "top top",
        pin: true,
        pinSpacing: false
    });
    
    const img = panel.querySelector('.project-mockup img');
    gsap.fromTo(img, 
        { scale: 1.22, opacity: 0.5 },
        { 
            scale: 1, 
            opacity: 0.95,
            scrollTrigger: { 
                trigger: panel, 
                start: "top bottom", 
                end: "top top", 
                scrub: true 
            }
        }
    );
});

// High scale network packets
// Dynamic stats calculations
const stats = document.querySelectorAll('.num-val');
stats.forEach(stat => {
    gsap.to(stat, {
        scrollTrigger: { trigger: stat, start: "top 80%" },
        innerHTML: stat.getAttribute('data-target'),
        duration: 2.2,
        snap: { innerHTML: 1 },
        ease: "power2.out"
    });
});

// Reveal standard headlines
const reveals = document.querySelectorAll('.reveal-text');
reveals.forEach(el => {
    const split = new SplitType(el, { types: 'words, chars' });
    gsap.from(split.chars, {
        opacity: 0,
        y: 40,
        rotateX: -40,
        stagger: 0.025,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
        }
    });
});
