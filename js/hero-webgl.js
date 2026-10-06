/* Hero: WebGL portrait (B&W -> color reveal), fog background, particles */
// ----------------------------------------------------
// 3. WebGL Cinematic Scene (Unified Render Loop)
// ----------------------------------------------------
const canvas = document.getElementById('webgl-canvas');
const bgCanvas = document.getElementById('bg-canvas');

// Portrait WebGL Setup (Transparency)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5.0;

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true, 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Background WebGL Setup (Gradient/Fog/Atmosphere)
const bgScene = new THREE.Scene();
const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    antialias: true
});
bgRenderer.setSize(window.innerWidth, window.innerHeight);
bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ----------------------------------------------------
// 4. Fluid Ripple Simulation Removed (Per User Request)
// ----------------------------------------------------

// ----------------------------------------------------
// 5. Textures Loading (Grayscale & Color Portraits)
// ----------------------------------------------------
const textureLoader = new THREE.TextureLoader();

const textureA = textureLoader.load(BASE64_BW, (tex) => {
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    portraitMaterial.uniforms.u_imageSize.value.set(tex.image.width, tex.image.height);
    imageAspectRatio = tex.image.width / tex.image.height;
    resize(); // Trigger initial resize adjustments
});

const textureB = textureLoader.load(BASE64_COLOR, (tex) => {
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
});

// ----------------------------------------------------
// 6. Volumetric Background Shaders
// ----------------------------------------------------
const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_scroll: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_scroll;
        varying vec2 vUv;

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                    -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                dot(x12.zw,x12.zw)), 0.0);
            m = m*m ; m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = vUv;
            
            // Bright Cinematic Palette Gradient (Light grey to warm white/cream)
            vec2 c = vec2(0.5, 0.5);
            float dist = length(uv - c);
            vec3 col = mix(vec3(0.97, 0.97, 0.98), vec3(0.93, 0.93, 0.95), dist);

            // Dynamic Ambient Light Ray / Spotlight source
            vec2 lightPos = u_mouse / u_resolution;
            float lightDist = length(uv - lightPos);
            vec3 spotlight = vec3(1.0, 0.3, 0.25) * (1.0 - smoothstep(0.0, 0.7, lightDist)) * 0.025;
            col += spotlight;

            // Volumetric Fog Animation
            float fog = snoise(uv * 1.5 + vec2(u_time * 0.03, u_time * 0.02)) * 0.5 + 0.5;
            float fog2 = snoise(uv * 2.8 - vec2(u_time * 0.04, -u_time * 0.035)) * 0.5 + 0.5;
            float combinedFog = mix(fog, fog2, 0.5);
            vec3 fogColor = vec3(0.92, 0.92, 0.94) * combinedFog * 0.035;
            col += fogColor;

            // Moving Light Rays
            vec2 raySrc = vec2(0.2, 0.95);
            vec2 diff = uv - raySrc;
            float rayAngle = atan(diff.y, diff.x);
            float rayNoise = snoise(vec2(rayAngle * 4.0, u_time * 0.08)) * 0.5 + 0.5;
            float rayFalloff = smoothstep(1.6, 0.0, length(diff));
            col += vec3(1.0, 0.98, 0.95) * rayNoise * rayFalloff * 0.008;

            // Subtle luxury film noise
            float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
            col += (grain - 0.5) * 0.012;

            // Fade to pure white as scroll increases
            float scrollFade = clamp(u_scroll / 600.0, 0.0, 1.0);
            col = mix(col, vec3(1.0), scrollFade);

            gl_FragColor = vec4(col, 1.0);
        }
    `
});

const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
bgScene.add(bgMesh);

// ----------------------------------------------------
// 7. Interactive Portrait Mesh Material (Shaders)
// ----------------------------------------------------
const portraitMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_textureA: { value: textureA },
        u_textureB: { value: textureB },
        u_time: { value: 0 },
        u_mouseMeshUv: { value: new THREE.Vector2(0.5, 0.5) },
        u_hoverStrength: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_imageSize: { value: new THREE.Vector2(1000, 1333) }, // original size aspect 3:4
        u_planeSize: { value: new THREE.Vector2(1, 1) },
        u_revealRadius: { value: 0.35 }, // Size of eyes reveal region in world space
        u_scroll: { value: 0 },
        u_tilt: { value: new THREE.Vector2() },
        u_textureBOffset: { value: new THREE.Vector2(0.0, 0.0) } // both portraits share identical framing, so no offset needed
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vViewPosition;
        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform sampler2D u_textureA;
        uniform sampler2D u_textureB;
        uniform float u_time;
        uniform vec2 u_mouseMeshUv;
        uniform float u_hoverStrength;
        uniform vec2 u_resolution;
        uniform vec2 u_imageSize;
        uniform vec2 u_planeSize;
        uniform float u_revealRadius;
        uniform float u_scroll;
        uniform vec2 u_textureBOffset;
        varying vec2 vUv;
        varying vec3 vViewPosition;

        // CSS object-fit cover math
        vec2 getCoverUV(vec2 uv, vec2 imgSize, vec2 planeSize) {
            float imgAspect = imgSize.x / imgSize.y;
            float planeAspect = planeSize.x / planeSize.y;
            
            vec2 scale = vec2(1.0);
            if (planeAspect > imgAspect) {
                scale.y = imgAspect / planeAspect;
            } else {
                scale.x = planeAspect / imgAspect;
            }
            
            return (uv - 0.5) * scale + 0.5;
        }

        void main() {
            vec2 coverUv = getCoverUV(vUv, u_imageSize, u_planeSize);

            // 1. Portrait A & B texture reads
            vec4 texColA = texture2D(u_textureA, coverUv);
            vec3 colA = texColA.rgb;

            // Apply offset to texture B's UV
            vec2 coverUvB = coverUv + u_textureBOffset;
            vec4 texColB = texture2D(u_textureB, coverUvB);
            vec3 colB = texColB.rgb;

            // 2. Spotlight Reveal Mask centered on cursor in local world space
            vec2 diff = (vUv - u_mouseMeshUv) * u_planeSize;
            float dist = length(diff);
            
            float radius = u_revealRadius;
            
            // Reveal mask with smooth edges
            float revealMask = smoothstep(radius, radius - 0.08, dist) * u_hoverStrength;

            // Combine Portraits A and B
            vec3 finalColor = mix(colA, colB, revealMask);
            float finalAlpha = mix(texColA.a, texColB.a, revealMask);

            // Output raw high-resolution colors directly to avoid post-process lighting blur

            // Fade portrait on scroll out
            float fadeFactor = 1.0 - clamp((u_scroll - 200.0) / 400.0, 0.0, 1.0);
            
            gl_FragColor = vec4(finalColor, finalAlpha * fadeFactor);
        }
    `,
    transparent: true,
    depthWrite: false
});

// 3D Plane Mesh for Portrait
const portraitGeometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const portraitMesh = new THREE.Mesh(portraitGeometry, portraitMaterial);
scene.add(portraitMesh);

// ----------------------------------------------------
// 8. Dynamic 3D Particle System
// ----------------------------------------------------
const particleCount = window.innerWidth < 768 ? 60 : 150;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPartData = [];

for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 5.0;
    const y = (Math.random() - 0.5) * 3.5;
    const z = (Math.random() - 0.5) * 2.0 - 0.5; // Spread around depth Z
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    initialPartData.push({
        x, y, z,
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        speedZ: (Math.random() - 0.5) * 0.008,
        amp: Math.random() * 0.08 + 0.02,
        freq: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2
    });
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 },
        u_mouse3D: { value: new THREE.Vector3() },
        u_scroll: { value: 0 }
    },
    vertexShader: `
        uniform float u_time;
        uniform vec3 u_mouse3D;
        varying float vAlpha;
        void main() {
            vec3 pos = position;
            
            // Subtle magnetic attraction
            float d = distance(pos, u_mouse3D);
            if (d < 2.0) {
                float pull = (1.0 - (d / 2.0)) * 0.16;
                pos = mix(pos, u_mouse3D, pull);
            }
            
            vAlpha = smoothstep(-2.5, 0.5, pos.z) * 0.65;
            
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (12.0 / -mvPos.z) * (1.0 + sin(u_time * 2.5 + pos.x) * 0.2);
            gl_Position = projectionMatrix * mvPos;
        }
    `,
    fragmentShader: `
        varying float vAlpha;
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            // Draw soft glowing spherical particles
            float glow = smoothstep(0.5, 0.0, dist);
            
            // Contrast charcoal / deep red code spark colors for bright background
            vec3 col = mix(vec3(0.08, 0.08, 0.12), vec3(0.85, 0.15, 0.1), gl_PointCoord.y);
            gl_FragColor = vec4(col, glow * vAlpha * 1.5);
        }
    `,
    transparent: true,
    depthWrite: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mouse3D = new THREE.Vector3();

// ----------------------------------------------------
// 9. Window Resize & Cover Calculations
// ----------------------------------------------------
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Portrait Canvas Render sizing
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Background Canvas sizing
    bgRenderer.setSize(width, height);
    bgMaterial.uniforms.u_resolution.value.set(width, height);
    
    // Adjust orthographic visible dimensions at z = 0
    const vFOV = camera.fov * Math.PI / 180;
    const visibleHeight = 2.0 * Math.tan(vFOV / 2.0) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;

    // Portrait Mesh scaling to act like "object-fit: contain/cover"
    const imgAspect = imageAspectRatio;
    const targetHeight = visibleHeight * 0.76; // Slightly larger for layout balance
    const targetWidth = targetHeight * imgAspect;

    if (visibleWidth * 0.95 < targetWidth) {
        const mobileWidth = visibleWidth * 0.9;
        portraitMesh.scale.set(mobileWidth, mobileWidth / imgAspect, 1.0);
    } else {
        portraitMesh.scale.set(targetWidth, targetHeight, 1.0);
    }

    // Set base Y coordinate so that the bottom of the portrait aligns with bottom of viewport
    portraitBaseY = -visibleHeight / 2.0 + portraitMesh.scale.y / 2.0;
    portraitMesh.position.y = portraitBaseY;

    // Sync plane size in material
    portraitMaterial.uniforms.u_planeSize.value.set(portraitMesh.scale.x, portraitMesh.scale.y);
    portraitMaterial.uniforms.u_resolution.value.set(width, height);
}

window.addEventListener('resize', resize);
resize();

// ----------------------------------------------------
// 10. WebGL Unified Rendering & Animation Loop
// ----------------------------------------------------
const clock = new THREE.Clock();
let prevX = -1;
let prevY = -1;
let uvMouse = new THREE.Vector2(-1, -1);
let speed = 0;
let targetSpeed = 0;

let meshTargetRotX = 0;
let meshTargetRotY = 0;

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const scrollY = window.scrollY;

    // Custom Cursor Dot matches mouse position instantly for sharp responsiveness
    mouseX = targetX;
    mouseY = targetY;
    
    // Custom Cursor Ring follows with a smooth, premium elastic lag
    ringX += (targetX - ringX) * 0.12;
    ringY += (targetY - ringY) * 0.12;

    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';

    // Calculate instantaneous mouse velocity for ripples
    if (prevX >= 0 && prevY >= 0) {
        const dist = Math.sqrt(Math.pow(targetX - prevX, 2) + Math.pow(targetY - prevY, 2));
        targetSpeed = Math.min(dist * 0.06, 1.5);
    }
    prevX = targetX;
    prevY = targetY;

    // Smooth speed decay for water
    speed += (targetSpeed - speed) * 0.1;
    targetSpeed *= 0.85; // rapid bleed out

    // Map mouse coordinates to WebGL texture coordinates
    uvMouse.set(targetX / window.innerWidth, targetY / window.innerHeight);

    // 2. Uniform updates for portrait shader
    portraitMaterial.uniforms.u_time.value = time;
    portraitMaterial.uniforms.u_scroll.value = scrollY;

    // 3. Keep Portrait Mesh stable (no floating drift)
    portraitMesh.position.y = portraitBaseY;
    portraitMesh.position.x = 0;

    // 4. Keep Portrait Mesh stable (no 3D Tilt following cursor)
    portraitMesh.rotation.set(0, 0, 0);

    // 5. Keep scale stable (no accumulative scroll zoom)
    // Base scale is computed in resize() and kept constant.

    // 6. Update 3D Raycast cursor coordinate for particles and portrait UV reveal
    raycaster.setFromCamera(new THREE.Vector2(
        (targetX / window.innerWidth) * 2.0 - 1.0,
        -(targetY / window.innerHeight) * 2.0 + 1.0
    ), camera);
    raycaster.ray.intersectPlane(mousePlane, mouse3D);
    particleMaterial.uniforms.u_mouse3D.value.copy(mouse3D);
    particleMaterial.uniforms.u_time.value = time;

    // Raycast against portraitMesh to find UV coordinates on the face for color reveal
    const intersects = raycaster.intersectObject(portraitMesh);
    let targetHoverStrength = 0.0;
    if (intersects.length > 0) {
        targetHoverStrength = 1.0;
        const uv = intersects[0].uv;
        portraitMaterial.uniforms.u_mouseMeshUv.value.x += (uv.x - portraitMaterial.uniforms.u_mouseMeshUv.value.x) * 0.12;
        portraitMaterial.uniforms.u_mouseMeshUv.value.y += (uv.y - portraitMaterial.uniforms.u_mouseMeshUv.value.y) * 0.12;
    }
    portraitMaterial.uniforms.u_hoverStrength.value += (targetHoverStrength - portraitMaterial.uniforms.u_hoverStrength.value) * 0.08;

    // 7. Slow particle animation drift
    const pPositions = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const data = initialPartData[i];
        // Perlin-like slow floating sine oscillation
        const wave = Math.sin(time * data.freq + data.phase) * data.amp;
        
        pPositions[i * 3] = data.x + wave * 0.6;
        pPositions[i * 3 + 1] = data.y + wave;
        
        // slow drift forward
        data.z += data.speedZ;
        if (data.z > 1.5) data.z = -2.5; // wrap particles
        pPositions[i * 3 + 2] = data.z;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // 8. Background atmosphere rendering
    bgMaterial.uniforms.u_time.value = time;
    bgMaterial.uniforms.u_mouse.value.set(mouseX, mouseY);
    bgMaterial.uniforms.u_scroll.value = scrollY;
    bgRenderer.render(bgScene, bgCamera);

    // 9. Main scene portrait rendering
    renderer.render(scene, camera);
}

animate();
