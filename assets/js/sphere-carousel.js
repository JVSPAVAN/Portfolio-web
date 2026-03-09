import * as THREE from 'three';
import gsap from 'gsap';

// --- CONFIGURATION ---
const showcaseSection = document.getElementById('showcase');
const container = document.getElementById('canvas-container');

const getContainerWidth = () => container.clientWidth;
const getContainerHeight = () => container.clientHeight;

const bgStyleStr = getComputedStyle(document.body).getPropertyValue('--body-color').trim() || '#f8fafc';
const config = {
    radius: window.innerWidth < 768 ? 4.5 : 6.0,
    cardWidth: window.innerWidth < 768 ? 2.2 : 3.0,
    cardHeight: window.innerWidth < 768 ? 3.3 : 4.5,
    cornerRound: 24 
};

const BASE_DATA = [
    { 
        img: "assets/img/1689937773702.jpeg", 
        text: "The first thing that springs to mind when I think of Pavan is \"exceptionally versatile\". At Tata Consultancy Services, I had the pleasure of working with him for three years. His versatility particularly amazed me. First trained as a front-end developer. He always finds a clever solution to finish challenging jobs on schedule. When a need arose, he was prepared to work on the backend development, and soon everyone on the team looked to him for guidance and problem-solving. He constantly has fresh ideas, which most of the time helps the team be more productive. He is a really extroverted individual that is a breeze to work with. Pavan has earned my highest endorsement as a leader.He would be valuable to any team.", 
        author: "Pavithra Seshadri", 
        stars: 5 
    },
    { 
        img: "assets/img/1605525460699.jpeg", 
        text: "Pavan's exceptional contributions as a Full Stack Developer at TCS over three years. His dedication, passion, and extraordinary skills have been nothing short of remarkable. His technical prowess and ability to tackle complex challenges with ease have consistently impressed not only his peers but also our clients and stakeholders. His attention to detail and commitment to delivering high-quality code have played a pivotal role in the success of numerous projects.", 
        author: "Geeta Rajput", 
        stars: 4 
    }
];

// Shuffle function to ensure random distribution
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let DATA = [];

// --- STATE ---
let activeIndex = 0;
let isFlipped = false;
let isAutoRotating = true; // Auto-rotate by default
let autoFlipTimer = null; // Store timer reference
let total = 0;
const cards = []; 
const cardVectors = []; 

async function fetchLinkedInRecommendations() {
    try {
        // NOTE: Calling LinkedIn API from front-end usually encounters CORS blocks.
        // It's recommended to route this via a backend API. 
        // Replace 'YOUR_LINKEDIN_ACCESS_TOKEN' with your valid OAuth token.
        const token = "AQXB6qpl1ZiWJ47R9sqqAMWSy4TO1Yf_9XXLx5e9tWJTMYLFPW4lAExZ5LwyRlMZuGqG4yvGg6HZVc4ik7IdZDQx4AajjD99kWAVZo4Eg_M3i2Ku9muMq8R3s96oAFG0ILI1FHeb8ibAD50lGLtbOi395tpz1xV--d3ukLQUjYXSDI0v8EmTjpgH7R-5l9-PdyxacHNnRIPemlUEhG0phvHPxSB_p_FACZ1de9fV2YS6oiBffC_vNfMI6mEOVojTEgszV7VJMNijFB-S4RivoESVr5d5WlYYMmUdwaIKTC31tf2On7W4ziGzPZo7e7B63vH5YQCUJLmFCQAeA3pmi1rt_oY9Qw"; 
        
        const linkedinUrl = "https://api.linkedin.com/v2/recommendation?q=recipient&statusFilters=List(VISIBLE)";
        
        const response = await fetch(linkedinUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Restli-Protocol-Version": "2.0.0"
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.elements && data.elements.length > 0) {
                return data.elements.map(item => ({
                    text: item.recommendationText || "",
                    author: "LinkedIn Connection", // LinkedIn API requires a separate request by URN to get names/pics
                    img: "assets/img/1605525460699.jpeg", // Default avatar placeholder
                    stars: 5 
                }));
            }
        } else {
            console.warn("LinkedIn API returned status:", response.status);
        }
    } catch (e) {
        console.warn("LinkedIn API request failed (likely CORS or missing token), using fallback.", e);
    }
    return null;
}

// --- SCENE SETUP ---
const scene = new THREE.Scene();

// We need to construct a Three Color from HSL string
const dummyEl = document.createElement('div');
dummyEl.style.color = bgStyleStr;
document.body.appendChild(dummyEl);
const rgbStr = getComputedStyle(dummyEl).color;
document.body.removeChild(dummyEl);

scene.background = null; // Disable solid background to make canvas transparent
scene.fog = new THREE.FogExp2(rgbStr, 0.015);

const camera = new THREE.PerspectiveCamera(45, getContainerWidth() / getContainerHeight(), 0.1, 100);
camera.position.z = 18; 

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(getContainerWidth(), getContainerHeight());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.SoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Fix washed out textures
    container.appendChild(renderer.domElement);
} catch (error) {
    console.error("WebGL Context Error:", error);
    const loader = document.getElementById('loader');
    if (loader) {
        loader.innerHTML = "WebGL hardware acceleration is disabled in your browser.<br>Please enable hardware acceleration in Chrome settings or use a supported browser to view the 3D showcase.";
        loader.style.color = "#ff6b6b";
        loader.style.fontSize = "1rem";
        loader.style.textAlign = "center";
        loader.style.padding = "2rem";
    }
    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) uiLayer.style.display = 'none';
    throw new Error("Halting sphere carousel: WebGL is unsupported/disabled in this environment.");
}

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(0, 10, 20);
dirLight.castShadow = true;
scene.add(dirLight);

const sphereGroup = new THREE.Group();
sphereGroup.position.y = -1.2; 
scene.add(sphereGroup);

// --- TEXTURES ---
function createRoundedImageTexture(url, width, height) {
    const canvas = document.createElement('canvas');
    const scale = 2; // Resolution scale
    canvas.width = width * 100 * scale;
    canvas.height = height * 100 * scale;
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const w = canvas.width;
            const h = canvas.height;
            const r = config.cornerRound * scale;

            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, r);
            ctx.clip();

            // Aspect Fill
            const imgAspect = img.width / img.height;
            const canvasAspect = w / h;
            let drawW, drawH, offsetX, offsetY;

            if (imgAspect > canvasAspect) {
                drawH = h;
                drawW = h * imgAspect;
                offsetY = 0;
                offsetX = (w - drawW) / 2;
            } else {
                drawW = w;
                drawH = w / imgAspect;
                offsetX = 0;
                offsetY = (h - drawH) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            resolve(texture);
        };
        img.src = url;
    });
}

function createReviewTexture(data) {
    const canvas = document.createElement('canvas');
    const scale = 2;
    // Match dimensions exactly to image texture for consistent radius look
    canvas.width = config.cardWidth * 100 * scale;
    canvas.height = config.cardHeight * 100 * scale;
    
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');

    const r = config.cornerRound * scale;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fillStyle = '#1e293b'; 
    ctx.fill();

    // Content scaling
    const fontSizeTitle = w * 0.08; 
    const fontSizeBody = w * 0.045; // reduced font size for text
    const fontSizeMeta = w * 0.04;

    ctx.font = `${fontSizeTitle}px sans-serif`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    const stars = "★".repeat(data.stars) + "☆".repeat(5 - data.stars);
    ctx.fillText(stars, w/2, h * 0.15); // moved stars up slightly

    ctx.font = `italic ${fontSizeBody}px sans-serif`;
    ctx.fillStyle = '#f1f5f9';
    const words = data.text.split(' ');
    let line = '';
    let y = h * 0.25; // start text higher
    const lineHeight = fontSizeBody * 1.5;
    const maxWidth = w * 0.85;

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, w/2, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, w/2, y);

    ctx.font = `bold ${fontSizeMeta}px sans-serif`;
    ctx.fillStyle = '#94a3b8';
    
    // Position author dynamically below the text, or fixed at bottom if there's room
    const authorY = Math.max(y + lineHeight * 2, h * 0.9);
    ctx.fillText(`— ${data.author}`, w/2, authorY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

function createShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.8)'); 
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
}
const shadowMap = createShadowTexture();

// --- BUILD SPHERE ---
const geometry = new THREE.PlaneGeometry(config.cardWidth, config.cardHeight);
const shadowGeo = new THREE.PlaneGeometry(config.cardWidth * 1.3, config.cardHeight * 1.3);
const phi = Math.PI * (3 - Math.sqrt(5)); 

async function initCards() {
    const apiData = await fetchLinkedInRecommendations();
    const sourceData = apiData || BASE_DATA;
    
    // Create 3 sets of data and shuffle them so neighbors are randomized and the sphere is full
    DATA = shuffleArray([...sourceData, ...sourceData, ...sourceData]).map((item, index) => ({
        ...item,
        uniqueId: index 
    }));
    total = DATA.length;

    for (let i = 0; i < total; i++) {
        const item = DATA[i];
        const y = 1 - (i / (total - 1)) * 2; 
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        cardVectors.push(new THREE.Vector3(x, y, z));
        const posX = x * config.radius;
        const posY = y * config.radius;
        const posZ = z * config.radius;

        const pivotGroup = new THREE.Group();
        pivotGroup.position.set(posX, posY, posZ);
        pivotGroup.userData = { id: i };

        const cardHolder = new THREE.Group();

        const matFront = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.FrontSide });
        const meshFront = new THREE.Mesh(geometry, matFront);
        meshFront.position.z = 0.01;

        createRoundedImageTexture(item.img, config.cardWidth, config.cardHeight).then(tex => {
            matFront.map = tex;
            matFront.needsUpdate = true;
        });

        const reviewTexture = createReviewTexture(item);
        const matBack = new THREE.MeshBasicMaterial({ 
            map: reviewTexture, 
            transparent: true,
            side: THREE.FrontSide 
        });
        const meshBack = new THREE.Mesh(geometry, matBack);
        meshBack.rotation.y = Math.PI;
        meshBack.position.z = -0.01;

        const matShadow = new THREE.MeshBasicMaterial({
            map: shadowMap,
            transparent: true,
            opacity: 0.6, 
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const meshShadow = new THREE.Mesh(shadowGeo, matShadow);
        meshShadow.position.z = -0.25; 

        cardHolder.add(meshShadow);
        cardHolder.add(meshFront);
        cardHolder.add(meshBack);
        pivotGroup.add(cardHolder);
        sphereGroup.add(pivotGroup);
        cards.push(pivotGroup);
    }

    // Initial State:
    // Point to first card, but let it auto-rotate initially
    const cardLocalVec = cardVectors[0].clone();
    const forward = new THREE.Vector3(0, 0, 1);
    sphereGroup.quaternion.setFromUnitVectors(cardLocalVec, forward);
    
    gsap.to('#loader', { opacity: 0, duration: 0.5, onComplete: () => document.getElementById('loader').style.display = 'none' });
}

initCards();

// --- ROTATION LOGIC ---
const targetQuaternion = new THREE.Quaternion();
const startQuaternion = new THREE.Quaternion();
const rotationState = { t: 0 }; 

function focusOnCard(index, duration = 1.2) {
    // 1. Cancel any existing auto-flip timers
    if (autoFlipTimer) clearTimeout(autoFlipTimer);

    // 2. IMPORTANT: Stop sphere rotation
    isAutoRotating = false;
    activeIndex = index;
    
    // 3. IMPORTANT: Reset flip state immediately so we see image while moving
    isFlipped = false; 

    // 4. Calculate rotation
    const cardLocalVec = cardVectors[index].clone();
    const forward = new THREE.Vector3(0, 0, 1);
    targetQuaternion.setFromUnitVectors(cardLocalVec, forward);
    startQuaternion.copy(sphereGroup.quaternion);
    rotationState.t = 0;

    gsap.killTweensOf(rotationState); 
    gsap.to(rotationState, {
        t: 1,
        duration: duration,
        ease: "power2.out", 
        onUpdate: () => {
            sphereGroup.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, rotationState.t);
        },
        onComplete: () => {
            // 5. Start the 5-second timer ONLY after movement lands
            autoFlipTimer = setTimeout(() => {
                isFlipped = true;
                updateCardVisuals();
                // NOTE: We do NOT resume auto-rotation here, per user request.
            }, 5000);
        }
    });
    
    updateCardVisuals();
}

function updateCardVisuals() {
    cards.forEach((pivot, index) => {
        const isActive = index === activeIndex;
        const holder = pivot.children[0];

        pivot.traverse((child) => {
            if (child.isMesh) child.renderOrder = isActive ? 999 : 0;
        });

        gsap.to(pivot.scale, {
            x: isActive ? 1.35 : 0.85,
            y: isActive ? 1.35 : 0.85,
            z: isActive ? 1.35 : 0.85,
            duration: 0.5
        });

        const targetY = (isActive && isFlipped) ? Math.PI : 0;
        gsap.to(holder.rotation, {
            y: targetY,
            duration: 0.6,
            ease: "back.out(1.2)"
        });
    });
}

// --- INTERACTION ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function getPivot(obj) {
    while (obj.parent && obj.parent !== sphereGroup) {
        obj = obj.parent;
    }
    return obj;
}

window.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    
    const rect = container.getBoundingClientRect();
    
    // Check if click is actually inside our section
    if (event.clientX < rect.left || event.clientX > rect.right || 
        event.clientY < rect.top || event.clientY > rect.bottom) {
        return;
    }

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const pivot = getPivot(intersects[0].object);
        if (pivot.userData.hasOwnProperty('id')) {
            const clickedIndex = pivot.userData.id;
            if (clickedIndex === activeIndex) {
                // Manual toggle if clicking active card
                isFlipped = !isFlipped;
                updateCardVisuals();
            } else {
                focusOnCard(clickedIndex); 
            }
        }
    }
});

// Use section hover to pause/resume auto rotation
showcaseSection.addEventListener('mouseenter', () => {
    isAutoRotating = false;
});

showcaseSection.addEventListener('mouseleave', () => {
    // If a card is currently flipped (inspected) or turning to be flipped, unflip it and resume
    if (isFlipped || autoFlipTimer !== null) {
        if (autoFlipTimer) clearTimeout(autoFlipTimer);
        autoFlipTimer = null;
        isFlipped = false;
        updateCardVisuals();
    }
    isAutoRotating = true;
});

document.getElementById('next-btn').addEventListener('click', () => {
    // Move to next logical index (randomized array prevents "same card" feeling)
    let nextIndex = (activeIndex + 1) % total;
    focusOnCard(nextIndex);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    let prevIndex = (activeIndex - 1 + total) % total;
    focusOnCard(prevIndex);
});

window.addEventListener('resize', () => {
    if(getContainerWidth() === 0 || getContainerHeight() === 0) return;
    camera.aspect = getContainerWidth() / getContainerHeight();
    camera.updateProjectionMatrix();
    renderer.setSize(getContainerWidth(), getContainerHeight());
});

const invQ = new THREE.Quaternion();

function animate() {
    requestAnimationFrame(animate);

    if (isAutoRotating) {
        const yAxis = new THREE.Vector3(0, 1, 0);
        const xAxis = new THREE.Vector3(1, 0, 0);
        sphereGroup.rotateOnWorldAxis(yAxis, 0.0015);
        sphereGroup.rotateOnWorldAxis(xAxis, Math.sin(Date.now() * 0.0005) * 0.001);
    }

    // Billboard Logic: Inverse rotation for cards
    invQ.copy(sphereGroup.quaternion).invert();
    cards.forEach(pivot => {
        pivot.quaternion.copy(invQ);
    });

    renderer.render(scene, camera);
}

animate();
