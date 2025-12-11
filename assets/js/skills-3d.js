/* 3D Skills Visualization using Three.js */

const initSkills3D = () => {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();
    
    // Camera setup - zoomed out to see full orbit system (Radius ~120)
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 15, 230); // Lowered Y further for visual center
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // GROUPS
    const solarSystem = new THREE.Group();
    scene.add(solarSystem);
    // Initial tilt to show rings better
    solarSystem.rotation.x = 0.1; 

    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    // 1. STARFIELD
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 1000;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const createCircleTexture = () => {
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 32;
        tCanvas.height = 32;
        const ctx = tCanvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        return tCanvas;
    };

    const particleMaterial = new THREE.PointsMaterial({
        size: 3,
        map: new THREE.CanvasTexture(createCircleTexture()),
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const stars = new THREE.Points(particlesGeometry, particleMaterial);
    particleGroup.add(stars);

    // 2. SUN (Orange/Yellow, Glowing)
    const sunGeom = new THREE.SphereGeometry(8, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    solarSystem.add(sun);

    // Sun Glow (Corona)
    const createGlowTexture = (color) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, 'rgba(255, 170, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,128,128);
        return canvas;
    };

    const sunGlowMat = new THREE.SpriteMaterial({ 
        map: new THREE.CanvasTexture(createGlowTexture('rgba(255, 200, 0, 1)')), 
        transparent: true, 
        blending: THREE.AdditiveBlending,
        opacity: 0.8,
        depthWrite: false
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.scale.set(60, 60, 1);
    solarSystem.add(sunGlow);

    // 3. SKILL ORBITS
    // Grouping skills to shared orbits for cleaner look
    const orbitGroups = [
        {
            radius: 50,
            speed: 0.002,
            skills: [
                { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
                { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
                { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" }
            ]
        },
        {
            radius: 80,
            speed: 0.0015,
            skills: [
                { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
                { name: "Spring", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
                { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
                { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" }
            ]
        },
        {
            radius: 110,
            speed: 0.001,
            skills: [
                { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
                { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
                { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" }
            ]
        }
    ];

    const textureLoader = new THREE.TextureLoader();

    // Helper: Orbit Line
    const createOrbit = (radius) => {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.rotateX(-Math.PI / 2);
        
        const material = new THREE.LineDashedMaterial({
            color: 0xffaa00, 
            linewidth: 1,
            scale: 1,
            dashSize: 3, 
            gapSize: 4,
            opacity: 0.3,
            transparent: true
        });
        const orbit = new THREE.Line(geometry, material);
        orbit.computeLineDistances();
        return orbit;
    };

    // Helper: Icon Sprite
    const createIconSprite = (url) => {
        const map = textureLoader.load(url);
        map.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({ map: map, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(14, 14, 1); 
        return sprite;
    };

    // Helper: Create Label Texture (Reusable for Theme Switch)
    const createLabelTexture = (text, color) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256; 
        canvas.height = 64; 
        const ctx = canvas.getContext('2d');
        ctx.font = "Bold 28px Arial";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        
        if (color === "white") {
            ctx.shadowColor = "black";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        } else {
            // Light theme (Black text) - minimal shadow or none
            ctx.shadowColor = "rgba(255,255,255,0.8)";
            ctx.shadowBlur = 0;
        }
        
        ctx.fillText(text, 128, 40);
        return new THREE.CanvasTexture(canvas);
    };

    // Helper: Label Sprite
    let isDark = document.body.classList.contains('dark-theme');

    const createLabelSprite = (text) => {
        const color = isDark ? "white" : "black";
        const texture = createLabelTexture(text, color);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
        sprite.scale.set(24, 6, 1);
        sprite.visible = false; 
        sprite.userData.isLabel = true; // Tag for updates
        return sprite;
    };
    
    // Helper: Theme Update
    const updateTheme = () => {
        isDark = document.body.classList.contains('dark-theme');
        
        const particleColor = isDark ? 0xffffff : 0x111111;
        const orbitColor = isDark ? 0xffaa00 : 0xcc6600;
        const labelColor = isDark ? "white" : "black";

        // 1. Stars
        stars.material.color.setHex(particleColor);
        stars.material.opacity = isDark ? 0.3 : 0.6; // Darker stars need more opacity?

        // 2. Orbits
        solarSystem.traverse((child) => {
            if (child.isLine) {
                 child.material.color.setHex(orbitColor);
                 child.material.opacity = isDark ? 0.3 : 0.5;
            }
        });
        
        // 3. Labels
        orbitObjects.forEach(obj => {
             const labelSprite = obj.group.children.find(c => c.isSprite && c.userData.isLabel);
             if (labelSprite) {
                 if (labelSprite.material.map) labelSprite.material.map.dispose();
                 labelSprite.material.map = createLabelTexture(obj.name, labelColor);
             }
        });
    };

    const orbitObjects = [];
    const raycastTargets = []; 

    orbitGroups.forEach(group => {
        // 1. Create Ring
        const orbit = createOrbit(group.radius);
        solarSystem.add(orbit);

        // 2. Add Skills
        const count = group.skills.length;
        group.skills.forEach((skill, index) => {
            const angleStep = (Math.PI * 2) / count;
            const currentAngle = index * angleStep;

            const skillGroup = new THREE.Group();
            solarSystem.add(skillGroup);

            const icon = createIconSprite(skill.icon);
            skillGroup.add(icon);
            raycastTargets.push(icon);

            const label = createLabelSprite(skill.name);
            label.position.y = 10;
            skillGroup.add(label);
            
            icon.userData = { label: label, name: skill.name };

            orbitObjects.push({
                group: skillGroup,
                radius: group.radius,
                speed: group.speed,
                angle: currentAngle,
                name: skill.name 
            });
        });
    });

    // RAYCASTER
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999); // Offscreen default

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    });
    
    container.addEventListener('mouseleave', () => {
         mouse.x = -999;
         mouse.y = -999;
    });

    // ANIMATION
    let time = 0;
    let wasDark = null;
    
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;
        
        // Check Theme
        const currentDark = document.body.classList.contains('dark-theme');
        if (currentDark !== wasDark) {
            updateTheme();
            wasDark = currentDark;
        }

        // 1. Particle Rotation
        particleGroup.rotation.y += 0.0005;

        // 2. Pulse Sun
        const scale = 50 + Math.sin(time * 2) * 5;
        sunGlow.scale.set(scale, scale, 1);
        sunGlow.material.rotation += 0.001; // subtle spin

    // 3. Orbits
        orbitObjects.forEach(obj => {
            obj.angle += obj.speed;
            obj.group.position.x = Math.cos(obj.angle) * obj.radius;
            obj.group.position.z = Math.sin(obj.angle) * obj.radius;
        });

        // 4. Raycasting (Hover)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets);
        
        // Reset state
        raycastTargets.forEach(icon => {
            if(icon.userData.label) icon.userData.label.visible = false;
            icon.scale.set(12, 12, 1);
            icon.material.opacity = 0.9;
        });

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            hit.material.opacity = 1;
            hit.scale.set(16, 16, 1);
            if (hit.userData.label) hit.userData.label.visible = true;
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'default';
        }
        
        // 5. Interactive Tilt (Towards Mouse)
        // Only tilt if mouse is inside container
        let targetRotX = 0.15; // Default tilt showing rings
        let targetRotY = 0;

        if (mouse.x > -900) {
            // Mouse Y (-1 to 1): -1 (Bottom) -> Tilt X Pos?
            // If I want to "look at" mouse:
            // Mouse Top (+1) -> System tilts Back (Top away? or Top towards?)
            // "Orbit towards mouse" -> Top comes towards? -> X Neg?
            targetRotX = 0.15 - (mouse.y * 0.08); // Subtle Pitch
            targetRotY = (mouse.x * 0.08);        // Subtle Yaw
        }

        solarSystem.rotation.x += (targetRotX - solarSystem.rotation.x) * 0.05;
        solarSystem.rotation.y += (targetRotY - solarSystem.rotation.y) * 0.05;
        solarSystem.rotation.z = 0; // Lock Z to keep horizontal horizon

        renderer.render(scene, camera);
    };

    animate();

    // RESIZE
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Wait for THREE
    const checkThree = setInterval(() => {
        if (typeof THREE !== 'undefined') {
            clearInterval(checkThree);
            initSkills3D();
        }
    }, 100);
});
