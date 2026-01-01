# API Reference

Complete API documentation for the Solar System Simulation engine.

---

## Table of Contents

1. [Global Objects](#global-objects)
2. [Core Systems](#core-systems)
3. [Entity System](#entity-system)
4. [Physics System](#physics-system)
5. [Rendering System](#rendering-system)
6. [Input System](#input-system)
7. [Camera System](#camera-system)
8. [Utilities](#utilities)

---

## Global Objects

### `window.game` (GameEngine)
Main game loop orchestrator. Access after initialization.

```javascript
window.game.player          // Player entity
window.game.sun            // Sun celestial body
window.game.entityManager  // Entity manager
window.game.physicsEngine  // Physics engine
window.game.renderer       // Renderer
window.game.camera         // Camera controller
window.game.inputHandler   // Input handler
window.game.telemetry      // Telemetry system
window.game.devConsole     // Dev console
```

### `window.DebugLog`
Global logging system.

```javascript
DebugLog.info(message)     // Info log
DebugLog.warn(message)     // Warning log
DebugLog.error(message)    // Error log
DebugLog.debug(message)    // Debug log
DebugLog.getLogs()         // Get all logs array
DebugLog.clear()           // Clear logs
DebugLog.subscribe(fn)     // Subscribe to new logs
```

### `Config`
Centralized configuration object.

```javascript
Config.physics             // Physics parameters
Config.render              // Rendering settings
Config.player              // Player settings
Config.camera              // Camera settings
Config.celestialBodies     // Array of body configs
Config.interactiveObjects  // Array of interactive object configs
Config.controls            // Input settings
```

### `Utilities`
Collection of helper functions.

See [Utilities](#utilities) section below.

---

## Core Systems

### GameEngine

Main orchestrator managing all systems.

#### Constructor
```javascript
new GameEngine()
```

Creates and initializes all subsystems. Throws error if initialization fails.

#### Methods

```javascript
// State control
game.setPaused(paused: boolean)
game.setTimeScale(scale: number)

// Query
game.getState(): object
{
    running: boolean,
    paused: boolean,
    deltaTime: number,
    entityCount: number,
    playerPosition: [x, y, z]
}

// Entity creation (internal use)
game.createWorld()
game.createCelestialBody(config)
game.createInteractiveObject(config)
game.createPlayer()
```

---

## Entity System

### Entity

Base class for all objects in the scene.

#### Constructor
```javascript
new Entity(id: number, config: object)

config = {
    name: string,
    type: string,
    position: { x, y, z },
    velocity: { x, y, z },
    rotation: { x, y, z },
    mass: number,
    radius: number,
    color: 0xRRGGBB,
    castShadow: boolean,
    receiveShadow: boolean,
    userData: object
}
```

#### Properties
```javascript
entity.id                  // Unique identifier
entity.name               // Entity name
entity.type               // Entity type string
entity.position           // THREE.Vector3
entity.velocity           // THREE.Vector3
entity.rotation           // THREE.Euler
entity.quaternion         // THREE.Quaternion
entity.mesh               // THREE.Mesh
entity.physicsBody        // Cannon-es Body
entity.active             // boolean
entity.visible            // boolean
entity.mass               // kg
entity.radius             // meters
```

#### Methods
```javascript
// Transform
entity.setPosition(x, y, z)
entity.setVelocity(x, y, z)
entity.setRotation(x, y, z)

// Queries
entity.distanceTo(other: Entity): number
entity.directionTo(other: Entity): Vector3

// Lifecycle
entity.update(deltaTime: number)
entity.destroy()

// Serialization
entity.serialize(): object
```

#### Events
```javascript
entity.onUpdate = (deltaTime) => { }
entity.onDestroy = () => { }
```

---

### CelestialBody extends Entity

Specialized entity for planets, moons, and stars.

#### Constructor
```javascript
new CelestialBody(id: number, config: object)

// Extends Entity config with:
config = {
    sceneRadius: number,       // Visual radius
    rotationSpeed: number,     // rad/frame
    luminosity: number,        // watts
    isLightSource: boolean,
    emissive: 0xRRGGBB,
    emissiveIntensity: number,
    axialTilt: number,         // radians
    type: 'planet' | 'moon' | 'star'
}
```

#### Additional Methods
```javascript
// Mesh creation
body.createGeometry(detailLevel: 'high'|'medium'|'low'): Geometry
body.createMaterial(fidelity: 'low'|'medium'|'ultra'): Material
body.createMesh(fidelity): Mesh

// LOD
body.updateLOD(cameraPosition: Vector3)

// Orbital mechanics
body.updateOrbitalPosition(deltaTime, parentPos, parentMass)
body.updateRotation(deltaTime)
```

---

### Blackhole extends CelestialBody

Special entity representing a black hole.

#### Constructor
```javascript
new Blackhole(id: number, config: object)

config = {
    // CelestialBody config plus:
    eventHorizonColor: 0xRRGGBB,
    accretionDiskColor: 0xRRGGBB,
    accretionDiskRadiusScale: number
}
```

#### Properties
```javascript
blackhole.schwarzschildRadius  // Calculated event horizon size
```

#### Methods
```javascript
// Calculate tidal forces
blackhole.calculateTidalForce(
    otherPosition: Vector3,
    otherMass: number,
    otherRadius: number
): number
```

---

### VolumetricObject extends Entity

Particle-based volumetric rendering for nebulae, clouds, etc.

#### Constructor
```javascript
new VolumetricObject(id: number, config: object)

config = {
    // Entity config plus:
    volumeScale: number,
    density: number,
    noiseScale: number
}
```

#### Methods
```javascript
volumeObject.createMesh(quality: 'low'|'medium'|'ultra'): Points
```

---

### EntityManager

Manages all entities in the scene.

#### Methods
```javascript
// Creation
manager.create(config): Entity

// Query
manager.getById(id: number): Entity
manager.getByType(type: string): Entity[]
manager.getAll(): Entity[]
manager.find(predicate: Function): Entity[]
manager.getCount(): number

// Updates
manager.updateAll(deltaTime: number)

// Lifecycle
manager.destroy(id: number)
manager.clear()
```

---

## Physics System

### PhysicsEngine

Wrapper around Cannon-es physics engine with N-body gravity support.

#### Constructor
```javascript
new PhysicsEngine()
```

#### Properties
```javascript
engine.world                // Cannon.World
engine.bodies               // Map<entityId, Cannon.Body>
engine.timeStep             // 1/60 by default
engine.substeps             // From Config.physics.substeps
engine.enabled              // boolean
```

#### Methods

**Body Management**
```javascript
engine.addBody(
    entityId: string,
    config: {
        mass: number,
        shape: Cannon.Shape,
        position: Cannon.Vec3,
        velocity: Cannon.Vec3,
        linearDamping?: number,
        angularDamping?: number
    }
): Cannon.Body

engine.removeBody(entityId: string)
engine.getBody(entityId: string): Cannon.Body
engine.getAllBodies(): Cannon.Body[]
engine.getBodyCount(): number
```

**Physics Operations**
```javascript
// Apply force
engine.applyForce(
    entityId: string,
    force: Cannon.Vec3,
    worldPoint?: Cannon.Vec3
)

// Apply impulse (instant velocity change)
engine.applyImpulse(
    entityId: string,
    impulse: Cannon.Vec3,
    relativePoint?: Cannon.Vec3
)

// Direct control
engine.setVelocity(entityId: string, velocity: Cannon.Vec3)
engine.getVelocity(entityId: string): Cannon.Vec3
engine.setPosition(entityId: string, position: Cannon.Vec3)
engine.getPosition(entityId: string): Cannon.Vec3
engine.setRotation(entityId: string, quaternion: Cannon.Quaternion)
```

**Gravity**
```javascript
// N-body forces
engine.applyGravitationalForces(entities: Entity[])

// Calculate force between two masses
engine.calculateGravitationalForce(
    body1Pos: Cannon.Vec3,
    body1Mass: number,
    body2Pos: Cannon.Vec3,
    body2Mass: number
): Cannon.Vec3
```

**Raycast**
```javascript
engine.raycast(
    origin: Cannon.Vec3,
    direction: Cannon.Vec3,
    maxDistance?: number
): {
    hit: boolean,
    body: Cannon.Body,
    point: Vector3,
    distance: number,
    normal: Vector3
}
```

**Simulation**
```javascript
engine.update(deltaTime: number)
engine.setEnabled(enabled: boolean)
engine.setTimeScale(scale: number)
engine.clear()
```

---

## Rendering System

### Renderer

Three.js wrapper with fidelity levels and optimization.

#### Constructor
```javascript
new Renderer(canvas: HTMLCanvasElement)
```

#### Properties
```javascript
renderer.scene              // THREE.Scene
renderer.camera             // (reference, not owned)
renderer.sunLight           // THREE.PointLight
renderer.ambientLight       // THREE.AmbientLight
renderer.fidelity          // 'low' | 'medium' | 'ultra'
renderer.frustum           // THREE.Frustum
```

#### Methods

**Setup**
```javascript
renderer.getScene(): THREE.Scene
renderer.getThreeRenderer(): THREE.WebGLRenderer

renderer.initializeSunLight(sunPosition: Vector3)
```

**Adding/Removing**
```javascript
renderer.add(object: Entity | THREE.Object3D)
renderer.remove(object: Entity | THREE.Object3D)
renderer.clear()
```

**Rendering**
```javascript
renderer.render(camera: THREE.Camera)
```

**Optimization**
```javascript
// Level of Detail
renderer.updateLOD(objects: Entity[], cameraPosition: Vector3)

// Visibility culling
renderer.performFrustumCulling(objects: Entity[])

// Quality settings
renderer.setFidelity(level: 'low' | 'medium' | 'ultra')
```

**Stats**
```javascript
renderer.getRenderInfo(): {
    calls: number,
    triangles: number,
    points: number,
    lines: number,
    textures: number,
    geometries: number,
    renderTime: number
}
```

**Lifecycle**
```javascript
renderer.onWindowResize()
renderer.dispose()
```

---

## Input System

### InputHandler

Manages keyboard, mouse, and gamepad input with pointer lock.

#### Constructor
```javascript
new InputHandler(canvas: HTMLCanvasElement)
```

#### Properties
```javascript
handler.isLocked               // boolean (pointer locked)
handler.keys                   // { [key]: boolean }
handler.mouseX, handler.mouseY // Current position
handler.mouseDeltaX, handler.mouseDeltaY // Movement this frame
handler.mouseDown              // boolean
handler.rightMouseDown         // boolean
```

#### Methods

**Pointer Lock**
```javascript
handler.requestPointerLock()
handler.releasePointerLock()
```

**Input Queries**
```javascript
// Key state
handler.isKeyPressed(key: string): boolean
handler.wasKeyPressed(key: string): boolean      // Just pressed this frame
handler.wasKeyReleased(key: string): boolean     // Just released this frame

// Axes
handler.getMovementInput(): { x, y, z }
handler.getLookInput(): { x, y }

// Actions
handler.isJumpPressed(): boolean
handler.isInteractPressed(): boolean
handler.isGrabPressed(): boolean
handler.isCrouchPressed(): boolean
handler.isAscendPressed(): boolean
handler.isDescendPressed(): boolean
```

**Updates**
```javascript
handler.update()  // Call once per frame
```

---

## Camera System

### CameraController

First-person and third-person camera with smooth transitions.

#### Constructor
```javascript
new CameraController(canvas: HTMLCanvasElement, aspect?: number)
```

#### Properties
```javascript
camera.camera                  // THREE.PerspectiveCamera
camera.mode                    // 'firstperson' | 'thirdperson'
camera.pitch                   // radians
camera.yaw                     // radians
camera.sensitivity             // multiplier
```

#### Methods

**Updates**
```javascript
camera.update(player: Player, deltaTime: number, lookInput: { x, y })
```

**Mode Control**
```javascript
camera.toggleMode()
camera.setMode(mode: 'firstperson' | 'thirdperson')
```

**Direction Vectors**
```javascript
camera.getForwardDirection(): Vector3
camera.getRightDirection(): Vector3
camera.getUpDirection(): Vector3
```

**Settings**
```javascript
camera.setSensitivity(sensitivity: number)
camera.onWindowResize(width: number, height: number)
```

**Serialization**
```javascript
camera.serialize(): {
    mode: string,
    pitch: number,
    yaw: number,
    position: [x, y, z],
    fov: number
}
```

---

## Player System

### Player extends Entity

Player-controlled character with dual-mode movement.

#### Constructor
```javascript
new Player(id: number, scene: THREE.Scene)
```

#### Properties
```javascript
player.freeFlyMode             // boolean
player.isGrounded              // boolean
player.heldObject              // object | null
player.eyeHeight               // meters
```

#### Methods

**Physics**
```javascript
player.createPhysicsBody(physicsEngine: PhysicsEngine)
```

**Input**
```javascript
player.setMovementInput(x: number, y: number, z: number)
```

**Movement**
```javascript
player.applyMovement(deltaTime: number, cameraDirection: Vector3)
player.jump()
player.toggleFreeFlyMode()
```

**Interaction**
```javascript
player.grabObject(raycastResult, physicsEngine)
player.releaseObject()
player.updateHeldObject()
player.performRaycast(physicsEngine): RayResult
```

**State**
```javascript
player.alignLocalUp()           // Gravity alignment
player.checkGround(entities, distance?)
player.getEyePosition(): Vector3
player.getForwardDirection(cameraDirection): Vector3

player.update(deltaTime: number, entities?: Entity[])
```

---

## Utilities

Helper functions and math operations.

### Math Operations

```javascript
// Basic math
Utilities.math.clamp(value, min, max)
Utilities.math.lerp(a, b, t)
Utilities.math.inverseLerp(a, b, value)
Utilities.math.smoothstep(edge0, edge1, x)
Utilities.math.map(value, inMin, inMax, outMin, outMax)

// Random
Utilities.math.random(min, max)           // [min, max)
Utilities.math.randomInt(min, max)        // [min, max]
Utilities.math.randomBool(probability)

// Trigonometry
Utilities.math.degToRad(deg)
Utilities.math.radToDeg(rad)
Utilities.math.sign(x)

// Number theory
Utilities.math.gcd(a, b)
Utilities.math.lcm(a, b)
Utilities.math.isPowerOfTwo(n)

// Physics
Utilities.math.calculateOrbitalVelocity(centralMass, distance, G?)
Utilities.math.calculateEscapeVelocity(mass, radius, G?)
Utilities.math.calculateGravitationalForce(m1, m2, distance, G?)
Utilities.math.calculateOrbitalPeriod(semiMajorAxis, centralMass, G?)
```

### Vector3 Operations

```javascript
// Creation & Copying
Utilities.vec3.create(x, y, z)
Utilities.vec3.copy(v)

// Arithmetic
Utilities.vec3.add(a, b)
Utilities.vec3.subtract(a, b)
Utilities.vec3.scale(v, scalar)

// Queries
Utilities.vec3.distance(a, b)
Utilities.vec3.magnitude(v)
Utilities.vec3.dot(a, b)
Utilities.vec3.cross(a, b)
Utilities.vec3.normalize(v)

// Interpolation
Utilities.vec3.lerp(a, b, t)
```

### Quaternion Operations

```javascript
Utilities.quat.create(x, y, z, w)
Utilities.quat.copy(q)
Utilities.quat.slerp(a, b, t)
Utilities.quat.fromAxisAngle(axis, angle)
```

### Color Operations

```javascript
Utilities.color.hexToRgb(hex): { r, g, b }
Utilities.color.rgbToHex(r, g, b)
Utilities.color.lerp(colorA, colorB, t)
```

### String Operations

```javascript
Utilities.string.format(template, ...args)
Utilities.string.padStart(str, length, padChar)
Utilities.string.padEnd(str, length, padChar)
Utilities.string.truncate(str, length, suffix)
```

### Array Operations

```javascript
Utilities.array.shuffle(arr)
Utilities.array.unique(arr)
Utilities.array.flatten(arr)
Utilities.array.chunk(arr, size)
Utilities.array.find(arr, predicate)
Utilities.array.findIndex(arr, predicate)
Utilities.array.remove(arr, predicate)
```

### Performance

```javascript
Utilities.performance.now()
Utilities.performance.measureTime(fn)
Utilities.performance.measureAsync(fn)
```

---

## Developer Console

### DevConsole

Real-time debugging and configuration interface.

#### Methods

```javascript
console.toggle()
console.open()
console.close()

console.addLog(entry: { timestamp, message, level })
console.clearLogs()

console.buildControls()
console.executeCommand(command: string)
```

---

## Telemetry

### Telemetry

Performance monitoring overlay.

#### Methods

```javascript
telemetry.update(player, renderer, entityCount)
telemetry.toggle()
telemetry.show()
telemetry.hide()
telemetry.getData(): {
    fps: number,
    frameTime: number,
    position: { x, y, z },
    velocity: { x, y, z },
    bodyCount: number,
    drawCalls: number,
    memory: number,
    uptime: number
}
```

---

## Debug Log

### DebugLog

Global logging system with automatic error capture.

```javascript
DebugLog.info(message: string)
DebugLog.warn(message: string)
DebugLog.error(message: string)
DebugLog.debug(message: string)

DebugLog.getLogs(): Array<LogEntry>
DebugLog.clear()
DebugLog.subscribe(callback: Function)
```

---

## Configuration Object (Config)

Complete configuration reference.

### physics
```javascript
{
    gravity: number,               // -9.81
    universalG: number,           // 6.67430e-11
    damping: number,              // 0.99
    angularDamping: number,       // 0.99
    substeps: number,             // 4
    timeScale: number             // 1.0
}
```

### render
```javascript
{
    fidelity: string,             // 'low' | 'medium' | 'ultra'
    shadowMapSize: number,        // 2048
    enableLOD: boolean,           // false
    enableFrustumCulling: boolean, // false
    ambientLight: number,         // 0.0
    shadowCascades: number        // 1
}
```

### player
```javascript
{
    height: number,               // 1.7
    radius: number,              // 0.3
    mass: number,                // 80
    walkSpeed: number,           // 6
    jumpForce: number,           // 7
    moveAccel: number,           // 30
    freeFlySpeed: number,        // 25
    freeFlyAccel: number,        // 50
    groundDrag: number,          // 0.2
    airDrag: number,             // 0.05
    eyeHeight: number,           // 1.6
    cameraSmoothing: number      // 0.1
}
```

### camera
```javascript
{
    fov: number,                 // 75
    near: number,                // 0.01
    far: number,                 // 1000000
    firstPerson: { offset: Vector3 },
    thirdPerson: {
        distance: number,        // 5
        height: number,          // 2
        lookAhead: number,       // 1.5
        smoothing: number        // 0.08
    }
}
```

### controls
```javascript
{
    pointerLock: boolean,        // true
    invertY: boolean,            // false
    sensitivity: number,         // 0.003
    gamepadEnabled: boolean      // true
}
```

---

## Examples

### Create Custom Entity

```javascript
class Satellite extends Entity {
    constructor(id, config) {
        super(id, config);
        this.type = 'satellite';
        this.orbitRadius = config.orbitRadius || 100;
    }
    
    createMesh() {
        const geometry = new THREE.BoxGeometry(1, 2, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
        return super.createMesh(geometry, material);
    }
    
    update(deltaTime) {
        // Custom logic
        super.update(deltaTime);
    }
}

// Use it
const sat = new Satellite(id, { name: 'ISS', color: 0xFFFFFF });
renderer.add(sat);
```

### Access Physics Data

```javascript
const earthBody = game.physicsEngine.getBody(earthEntity.id);
const position = earthBody.position; // Cannon.Vec3
const velocity = earthBody.velocity; // Cannon.Vec3

// Modify directly
earthBody.velocity.x += 100;
```

### Query Entities

```javascript
// Get all planets
const planets = game.entityManager.getByType('planet');

// Find specific body
const earth = game.entityManager.find(e => e.name === 'Earth')[0];

// Get count
const total = game.entityManager.getCount();
```

### Modify Settings Live

```javascript
// Via Dev Console command
Config.physics.timeScale = 10;
Config.render.fidelity = 'ultra';
game.renderer.setFidelity('ultra');

// Or via input handler
game.inputHandler.setSensitivity(0.01);
```

---

For more information, see `README.md` and `QUICKSTART.md`.

