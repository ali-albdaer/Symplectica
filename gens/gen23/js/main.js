// Main Entry Point

async function init() {
    // --- Setup Three.js ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        window.Config.graphics.fov, 
        window.innerWidth / window.innerHeight, 
        window.Config.graphics.near, 
        window.Config.graphics.far
    );

    const renderer = new THREE.WebGLRenderer({ antialias: window.Config.graphics.fidelity !== 'low' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // --- Setup Systems ---
    const physicsEngine = new PhysicsEngine();
    const inputManager = new InputManager();
    
    // --- Create Entities ---
    const bodies = {}; // Map name -> body

    // 1. Sun
    const sunConfig = window.Config.initialState.sun;
    const sun = new CelestialBody(sunConfig, physicsEngine, scene);
    bodies[sunConfig.name] = sun;

    // 2. Planets
    for (const pConfig of window.Config.initialState.bodies) {
        // Calculate position (random angle on plane)
        const angle = Math.random() * Math.PI * 2;
        const dist = pConfig.distance;
        pConfig.position = {
            x: Math.cos(angle) * dist,
            y: 0,
            z: Math.sin(angle) * dist
        };
        
        const planet = new CelestialBody(pConfig, physicsEngine, scene);
        
        // Calculate Velocity for Circular Orbit
        // v = sqrt(GM/r)
        // Direction: Tangent
        const velMag = Math.sqrt((window.Config.physics.G * sun.mass) / dist);
        const velDir = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)); // Tangent
        planet.velocity.copy(velDir.multiplyScalar(velMag));
        
        bodies[pConfig.name] = planet;
    }

    // 3. Moons
    for (const mConfig of window.Config.initialState.moons) {
        const parent = bodies[mConfig.parent];
        if (!parent) {
            console.error(`Parent ${mConfig.parent} not found for moon ${mConfig.name}`);
            continue;
        }

        const angle = Math.random() * Math.PI * 2;
        const dist = mConfig.distance;
        
        // Position relative to parent
        mConfig.position = {
            x: parent.position.x + Math.cos(angle) * dist,
            y: parent.position.y,
            z: parent.position.z + Math.sin(angle) * dist
        };

        const moon = new CelestialBody(mConfig, physicsEngine, scene);

        // Velocity: Parent Velocity + Orbital Velocity
        const velMag = Math.sqrt((window.Config.physics.G * parent.mass) / dist);
        const velDir = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
        moon.velocity.copy(parent.velocity.clone().add(velDir.multiplyScalar(velMag)));

        bodies[mConfig.name] = moon;
    }

    // 4. Player
    const player = new Player(scene, camera, physicsEngine, inputManager);
    player.spawn(bodies["Planet 1"]);

    // 5. Props (Interactive Objects)
    for (let i = 0; i < 5; i++) {
        const offset = new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize().multiplyScalar(5);
        const pos = player.position.clone().add(offset);
        // Adjust height to be above ground
        pos.add(player.groundNormal.clone().multiplyScalar(2));
        
        new Prop({
            mass: 0.5,
            radius: 0.5,
            position: pos,
            velocity: player.velocity, // Match planet velocity
            color: Math.random() * 0xffffff,
            emissive: Math.random() > 0.7 ? 0xff0000 : 0
        }, physicsEngine, scene);
    }

    // --- Starfield ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 10000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 2, sizeAttenuation: false});
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- UI ---
    const ui = new UIManager(player, physicsEngine);

    // --- Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const dt = Math.min(clock.getDelta(), 0.1); // Cap dt to avoid explosions on lag

        physicsEngine.update(window.Config.physics.dt); // Fixed physics step
        player.update(dt);
        ui.update();
        inputManager.update();

        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start
    animate();
}

// Error Handling
window.onerror = function(msg, url, line, col, error) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.background = 'rgba(255,0,0,0.8)';
    div.style.color = 'white';
    div.style.padding = '20px';
    div.style.zIndex = 9999;
    div.innerText = `Error: ${msg}\nLine: ${line}`;
    document.body.appendChild(div);
    return false;
};

init();
