# Advanced Configuration Guide

## Physics Tuning

### Achieving Stable Orbits

For a circular orbit, the orbital velocity must satisfy:
```
v = sqrt(G * M / r)
```

Where:
- `v` = orbital velocity
- `G` = gravitational constant (Config.physics.G)
- `M` = mass of central body
- `r` = orbital radius

**Example** (Planet 1 around Sun):
```javascript
// Sun mass: 1,000,000
// Distance: 200 units
// G: 6.674
v = sqrt(6.674 * 1000000 / 200) = sqrt(33370) ≈ 182.68

// However, we use 28.5 for gameplay balance (slower, more visible)
// This creates a slightly elliptical orbit
```

### Adding a New Planet

```javascript
// In Config.js -> celestialBodies
planet3: {
    name: 'NewPlanet',
    type: 'planet',
    mass: 1500,                    // Affects gravitational pull
    radius: 15,
    position: [600, 0, 0],         // Distance from sun
    velocity: [0, 0, -15.0],       // Tangential velocity
    rotationSpeed: 0.006,
    color: 0xFF6347,               // Tomato red
    emissive: 0x000000,
    emissiveIntensity: 0,
    density: 4.2,
    castShadow: true,
    receiveShadow: true,
    atmosphere: {
        enabled: false,
    }
},
```

Then add to `main.js` → `createCelestialBodies()`:
```javascript
if (celestialConfig.planet3) {
    const planet3 = new CelestialBody(celestialConfig.planet3, this.physicsWorld);
    this.celestialBodies.push(planet3);
    this.engine.addCelestialBody(planet3);
    console.log(`✓ Created: ${celestialConfig.planet3.name}`);
}
```

## Advanced Camera Controls

### Custom Camera Modes

To add a cinematic camera mode, modify `Player.js`:

```javascript
// Add to Player constructor
this.cinematicPath = [];
this.cinematicIndex = 0;
this.cinematicMode = false;

// Add to update() method
if (this.cinematicMode) {
    this.updateCinematicCamera();
} else {
    this.updateCamera();
}

// New method
updateCinematicCamera() {
    if (this.cinematicPath.length === 0) return;
    
    const target = this.cinematicPath[this.cinematicIndex];
    this.camera.position.lerp(target.position, 0.02);
    this.camera.lookAt(target.lookAt);
    
    // Auto-advance
    if (this.camera.position.distanceTo(target.position) < 1) {
        this.cinematicIndex = (this.cinematicIndex + 1) % this.cinematicPath.length;
    }
}
```

## Black Hole Implementation

Currently configured but disabled in `Config.js`. To enable:

### 1. Set `enabled: true` in Config.js

```javascript
specialEntities: {
    blackhole: {
        enabled: true,
        name: 'Singularity',
        mass: 5000000,
        schwarzschildRadius: 100,
        position: [-2000, 0, 0],
        eventHorizonShader: true,
    }
}
```

### 2. Create BlackHole class in `CelestialBody.js`

```javascript
export class BlackHole extends CelestialBody {
    constructor(config, physicsWorld) {
        super(config, physicsWorld);
        this.schwarzschildRadius = config.schwarzschildRadius;
        this.createEventHorizon();
    }
    
    createEventHorizon() {
        // Create visual event horizon
        const geometry = new THREE.SphereGeometry(this.schwarzschildRadius, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                void main() {
                    float distortion = sin(vUv.y * 10.0 + time) * 0.5 + 0.5;
                    gl_FragColor = vec4(0.0, 0.0, distortion, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
        });
        
        this.eventHorizonMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.eventHorizonMesh);
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update shader time
        if (this.eventHorizonMesh) {
            this.eventHorizonMesh.material.uniforms.time.value += deltaTime;
        }
    }
    
    // Override gravitational calculation for extreme pull
    getGravityAtPoint(position) {
        const gravity = super.getGravityAtPoint(position);
        
        const distance = this.getDistanceFromCenter(position);
        
        // Inside event horizon: infinite pull
        if (distance < this.schwarzschildRadius) {
            return gravity.multiplyScalar(1000); // Extreme force
        }
        
        return gravity;
    }
}
```

### 3. Initialize in main.js

```javascript
if (Config.specialEntities.blackhole.enabled) {
    const blackhole = new BlackHole(
        Config.specialEntities.blackhole,
        this.physicsWorld
    );
    this.celestialBodies.push(blackhole);
    this.engine.addCelestialBody(blackhole);
}
```

## Custom Shaders

### Planet Atmosphere Shader

Replace simple atmosphere with volumetric shader:

```javascript
createAtmosphere() {
    const radius = this.config.radius * 1.1;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 1.0 },
            p: { value: 3.5 },
            glowColor: { value: new THREE.Color(this.config.atmosphere.color) },
            viewVector: { value: this.engine.camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;
            
            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);
                vec3 vNormel = normalize(normalMatrix * viewVector);
                intensity = pow(c - dot(vNormal, vNormel), p);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    
    this.atmosphereMesh = new THREE.Mesh(geometry, material);
    this.mesh.add(this.atmosphereMesh);
}
```

## Performance Profiling

### Add Performance Monitoring

In `Engine.js`, add detailed profiling:

```javascript
constructor() {
    // ... existing code ...
    
    this.performanceMetrics = {
        physics: 0,
        rendering: 0,
        updates: 0,
        total: 0,
    };
}

update(deltaTime) {
    const updateStart = performance.now();
    
    // Physics
    const physicsStart = performance.now();
    if (this.physicsWorld) {
        this.physicsWorld.update(deltaTime);
    }
    this.performanceMetrics.physics = performance.now() - physicsStart;
    
    // Updates
    const updatesStart = performance.now();
    for (const body of this.celestialBodies) {
        body.update(scaledDelta);
    }
    // ... other updates ...
    this.performanceMetrics.updates = performance.now() - updatesStart;
    
    this.performanceMetrics.total = performance.now() - updateStart;
}

// Add to telemetry
getStats() {
    return {
        fps: this.fps,
        frameTime: this.frameTime.toFixed(2),
        physicsTime: this.performanceMetrics.physics.toFixed(2),
        updateTime: this.performanceMetrics.updates.toFixed(2),
        bodies: this.celestialBodies.length + this.interactiveObjects.length,
        isPaused: this.isPaused,
    };
}
```

## Multi-Body Systems

### Creating a Binary Star System

```javascript
// In Config.js
celestialBodies: {
    star1: {
        name: 'Star Alpha',
        type: 'star',
        mass: 800000,
        radius: 40,
        position: [-100, 0, 0],
        velocity: [0, 0, -10],  // Orbiting each other
        // ... other properties
    },
    star2: {
        name: 'Star Beta',
        type: 'star',
        mass: 800000,
        radius: 40,
        position: [100, 0, 0],
        velocity: [0, 0, 10],   // Opposite direction
        // ... other properties
    },
    // Planets orbit the barycenter (center of mass)
}
```

### Lagrange Points

Calculate L1 point between two bodies:

```javascript
// In PhysicsWorld.js or utility file
function calculateL1Point(body1, body2) {
    const M1 = body1.config.mass;
    const M2 = body2.config.mass;
    const R = body1.mesh.position.distanceTo(body2.mesh.position);
    
    // Simplified L1 approximation
    const r = R * Math.pow(M2 / (3 * M1), 1/3);
    
    const direction = new THREE.Vector3()
        .subVectors(body2.mesh.position, body1.mesh.position)
        .normalize();
    
    return body1.mesh.position.clone().add(direction.multiplyScalar(r));
}
```

## Debugging Tools

### Visualize Gravitational Forces

Add to `PhysicsWorld.js`:

```javascript
debugDrawGravity(scene, body) {
    // Remove old arrows
    scene.children = scene.children.filter(child => !child.userData.isGravityArrow);
    
    for (const gravBody of this.gravitationalBodies) {
        const force = this.calculateGravityForce(body.position, gravBody);
        
        const arrow = new THREE.ArrowHelper(
            force.normalize(),
            body.position,
            force.length() * 10,  // Scale for visibility
            0xff0000
        );
        
        arrow.userData.isGravityArrow = true;
        scene.add(arrow);
    }
}
```

### Orbit Path Visualization

```javascript
// In CelestialBody.js
recordOrbitPath(maxPoints = 1000) {
    if (!this.orbitPath) {
        this.orbitPath = [];
        this.orbitGeometry = new THREE.BufferGeometry();
        this.orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
        this.orbitLine = new THREE.Line(this.orbitGeometry, this.orbitMaterial);
        this.engine.scene.add(this.orbitLine);
    }
    
    // Record position
    this.orbitPath.push(this.mesh.position.clone());
    
    if (this.orbitPath.length > maxPoints) {
        this.orbitPath.shift();
    }
    
    // Update geometry
    const positions = new Float32Array(this.orbitPath.length * 3);
    this.orbitPath.forEach((pos, i) => {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
    });
    
    this.orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
}
```

## Keyboard Shortcuts for Development

Add to `UIManager.js`:

```javascript
setupEventListeners() {
    // ... existing code ...
    
    document.addEventListener('keydown', (e) => {
        // Debug shortcuts
        if (e.shiftKey && e.code === 'KeyP') {
            // Pause physics
            this.engine.togglePause();
        }
        
        if (e.shiftKey && e.code === 'KeyR') {
            // Restart simulation
            location.reload();
        }
        
        if (e.shiftKey && e.code === 'KeyG') {
            // Toggle gravity visualization
            Config.debug.showGravityVectors = !Config.debug.showGravityVectors;
        }
    });
}
```

---

**Remember**: Always test configuration changes incrementally to identify issues quickly!
