# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SOLAR SYSTEM SIMULATION                  │
│                         (Browser)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        index.html                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Three.js   │  │  Cannon.js   │  │  ES6 Modules │       │
│  │   (CDN)     │  │    (CDN)     │  │    (Local)   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         main.js (Entry)
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       ┌─────────┐      ┌──────────┐     ┌──────────┐
       │ Engine  │◄─────┤ Config.js├────►│UIManager │
       └────┬────┘      └──────────┘     └────┬─────┘
            │                                   │
     ┌──────┼────────┐                         │
     ▼      ▼        ▼                         ▼
┌─────┐  ┌────┐  ┌──────┐               ┌──────────┐
│Scene│  │Cam │  │Render│               │Telemetry │
└─────┘  └────┘  └──────┘               └──────────┘
     │
     └───────────────┬─────────────────┐
                     ▼                 ▼
              ┌──────────────┐  ┌─────────────┐
              │PhysicsWorld  │  │   Player    │
              └──────┬───────┘  └──────┬──────┘
                     │                 │
         ┌───────────┼─────────────────┘
         ▼           ▼
    ┌─────────┐  ┌────────┐
    │Celestial│  │Physics │
    │ Bodies  │  │ Bodies │
    └─────────┘  └────────┘
```

## Module Relationships

### 1. Core Modules

#### main.js (Entry Point)
- **Role**: Application orchestrator
- **Dependencies**: All modules
- **Responsibilities**:
  - Initialize all subsystems
  - Create celestial bodies from config
  - Handle fatal errors
  - Global error catching

#### Config.js (Data Layer)
- **Role**: Centralized configuration
- **Dependencies**: None
- **Exports**:
  - `Config` object (all settings)
  - `updateConfig()` function
  - `getConfig()` function
- **Consumers**: All modules

#### Engine.js (Core Loop)
- **Role**: Main game loop and scene management
- **Dependencies**: Config, Three.js
- **Key Methods**:
  - `init()`: Setup Three.js scene
  - `start()`: Begin animation loop
  - `update(deltaTime)`: Update all subsystems
  - `render()`: Render frame
- **Responsibilities**:
  - Animation loop (requestAnimationFrame)
  - Performance tracking (FPS, frame time)
  - Scene management
  - Camera updates
  - Subsystem orchestration

### 2. Physics Layer

#### PhysicsWorld.js
- **Role**: Physics simulation engine
- **Dependencies**: Config, Cannon.js
- **Key Methods**:
  - `init()`: Create Cannon world
  - `update(deltaTime)`: Fixed timestep physics
  - `applyGravitationalForces()`: N-body gravity
  - `createSphereBody()`, `createBoxBody()`: Body factories
- **Responsibilities**:
  - Cannon.js world management
  - N-body gravitational calculations
  - Fixed timestep accumulator
  - Physics body creation/management
  - Collision handling

### 3. Entity Layer

#### CelestialBody.js
- **Role**: Planets, stars, moons representation
- **Dependencies**: Config, PhysicsWorld, Three.js
- **Classes**:
  - `CelestialBody`: Base class for planets/stars
  - `InteractiveObject`: Small physics objects
- **Key Methods**:
  - `createMesh()`: Visual representation with LOD
  - `createPhysicsBody()`: Physics representation
  - `update(deltaTime)`: Self-rotation
  - `getSurfaceNormal()`: For player gravity alignment
- **Responsibilities**:
  - Visual mesh creation (Three.js)
  - Physics body creation (Cannon.js)
  - LOD management
  - Atmosphere effects

#### Player.js
- **Role**: Player controller
- **Dependencies**: Config, PhysicsWorld, Engine, Three.js
- **Key Methods**:
  - `setupControls()`: Input handling
  - `update(deltaTime)`: Movement and camera
  - `updateWalkingMode()`: Ground-based movement
  - `updateFlightMode()`: 6-DOF movement
  - `updateCamera()`: First/third person camera
- **Responsibilities**:
  - Keyboard/mouse input
  - Dual-mode movement (walk/flight)
  - Camera control
  - Pointer lock management
  - Object interaction (grab/release)
  - Gravity alignment

### 4. UI Layer

#### UIManager.js
- **Role**: User interface and debugging tools
- **Dependencies**: Config, Engine, Player
- **Key Methods**:
  - `init()`: Setup UI elements
  - `setupDevConsole()`: Developer console controls
  - `updateTelemetry()`: Real-time performance display
  - `addLog()`: Debug logging
  - `applySettings()`: Live config updates
- **Responsibilities**:
  - Telemetry overlay
  - Debug log display
  - Developer console
  - Settings management
  - Error display
  - Loading screen

## Data Flow

### Initialization Sequence

```
1. main.js loads
2. Create Engine
   └── Setup Three.js scene, camera, renderer
3. Create PhysicsWorld
   └── Setup Cannon.js world
4. Inject PhysicsWorld into Engine
5. Create CelestialBodies
   ├── Create visual mesh (Three.js)
   ├── Create physics body (Cannon.js)
   └── Add to Engine and PhysicsWorld
6. Create InteractiveObjects
   └── Same as CelestialBodies
7. Create Player
   ├── Create physics body
   ├── Setup input handlers
   └── Inject camera reference
8. Create UIManager
   ├── Setup event listeners
   └── Inject Engine and Player references
9. Start Engine
   └── Begin animation loop
```

### Frame Update Sequence

```
requestAnimationFrame()
    ├── Get deltaTime
    │
    ├── UPDATE PHASE
    │   ├── PhysicsWorld.update(deltaTime)
    │   │   ├── Apply N-body gravity forces
    │   │   ├── Step Cannon.js world (fixed timestep)
    │   │   └── Sync Three.js meshes with physics
    │   │
    │   ├── CelestialBody.update() [for each]
    │   │   └── Apply self-rotation
    │   │
    │   ├── InteractiveObject.update() [for each]
    │   │   └── Apply gravity to body
    │   │
    │   ├── Player.update(deltaTime)
    │   │   ├── Process input
    │   │   ├── Update movement (walk/flight)
    │   │   ├── Update grabbed object
    │   │   └── Update camera position
    │   │
    │   └── UIManager.update()
    │       └── Update control info
    │
    ├── RENDER PHASE
    │   └── renderer.render(scene, camera)
    │
    └── PERFORMANCE TRACKING
        ├── Increment frame count
        ├── Calculate frame time
        └── Update FPS (every 1000ms)
```

### Input Flow

```
User Input
    │
    ├── Keyboard Event
    │   ├── Player.onKeyDown()
    │   │   └── Update keys state
    │   └── UIManager event handlers
    │       └── Toggle UI elements
    │
    ├── Mouse Move Event
    │   └── Player.onMouseMove()
    │       ├── Update pitch/yaw
    │       └── Rotate camera
    │
    └── Mouse Click Event
        └── Player.onMouseDown()
            └── Interact with objects (grab/release)
```

### Physics Calculations

```
PhysicsWorld.update()
    │
    ├── Accumulate deltaTime
    │
    └── While accumulator >= fixedTimeStep:
        │
        ├── Apply N-body Gravity
        │   └── For each pair of gravitational bodies:
        │       ├── Calculate distance vector
        │       ├── Calculate force: F = G×m1×m2/r²
        │       └── Apply equal/opposite forces
        │
        ├── Apply Gravity to Non-Gravitational Bodies
        │   └── For each interactive object:
        │       └── Calculate and apply gravity from all planets
        │
        ├── Step Cannon.js World
        │   └── world.step(fixedTimeStep)
        │
        └── Decrement accumulator
```

## Class Diagrams

### Engine Class
```
┌─────────────────────────────────────┐
│            Engine                    │
├─────────────────────────────────────┤
│ - scene: THREE.Scene                │
│ - camera: THREE.Camera              │
│ - renderer: THREE.Renderer          │
│ - physicsWorld: PhysicsWorld        │
│ - player: Player                    │
│ - uiManager: UIManager              │
│ - celestialBodies: Array            │
│ - interactiveObjects: Array         │
│ - fps: Number                       │
│ - isRunning: Boolean                │
├─────────────────────────────────────┤
│ + init(): Promise                   │
│ + start(): void                     │
│ + stop(): void                      │
│ + update(deltaTime): void           │
│ + render(): void                    │
│ + addCelestialBody(body): void      │
│ + updateGraphicsSettings(obj): void │
│ + getStats(): Object                │
└─────────────────────────────────────┘
```

### PhysicsWorld Class
```
┌─────────────────────────────────────┐
│         PhysicsWorld                 │
├─────────────────────────────────────┤
│ - world: CANNON.World               │
│ - bodies: Map<Mesh, Body>           │
│ - gravitationalBodies: Array        │
│ - accumulator: Number               │
│ - fixedTimeStep: Number             │
├─────────────────────────────────────┤
│ + init(): void                      │
│ + update(deltaTime): void           │
│ + applyGravitationalForces(): void  │
│ + applyGravityToBody(body): void    │
│ + createSphereBody(...): Body       │
│ + createBoxBody(...): Body          │
│ + addBody(mesh, body, isGrav): void │
│ + raycast(from, to): Object         │
└─────────────────────────────────────┘
```

### CelestialBody Class
```
┌─────────────────────────────────────┐
│        CelestialBody                 │
├─────────────────────────────────────┤
│ - config: Object                    │
│ - physicsWorld: PhysicsWorld        │
│ - mesh: THREE.LOD                   │
│ - body: CANNON.Body                 │
│ - atmosphereMesh: THREE.Mesh        │
├─────────────────────────────────────┤
│ + init(): void                      │
│ + createMesh(): void                │
│ + createPhysicsBody(): void         │
│ + update(deltaTime): void           │
│ + getSurfaceNormal(pos): Vector3    │
│ + getDistanceFromCenter(pos): Num   │
│ + getGravityAtPoint(pos): Vector3   │
└─────────────────────────────────────┘
```

### Player Class
```
┌─────────────────────────────────────┐
│            Player                    │
├─────────────────────────────────────┤
│ - camera: THREE.Camera              │
│ - physicsWorld: PhysicsWorld        │
│ - engine: Engine                    │
│ - mesh: THREE.Mesh                  │
│ - body: CANNON.Body                 │
│ - mode: String (walk/flight)        │
│ - keys: Object                      │
│ - pitch: Number                     │
│ - yaw: Number                       │
│ - isGrounded: Boolean               │
│ - grabbedObject: Object             │
├─────────────────────────────────────┤
│ + init(): void                      │
│ + setupControls(): void             │
│ + update(deltaTime): void           │
│ + updateWalkingMode(dt): void       │
│ + updateFlightMode(dt): void        │
│ + updateCamera(): void              │
│ + toggleFlightMode(): void          │
│ + jump(): void                      │
│ + interact(): void                  │
│ + grabObject(obj): void             │
│ + releaseObject(): void             │
└─────────────────────────────────────┘
```

## Performance Considerations

### Fixed Timestep Physics
- **Why**: Ensures deterministic, stable physics
- **How**: Accumulator pattern with fixed 1/60s steps
- **Benefit**: Consistent simulation regardless of frame rate

### LOD System
- **High Detail**: < 500 units (64x64 sphere)
- **Medium Detail**: 500-2000 units (32x32 sphere)
- **Low Detail**: > 2000 units (16x16 sphere)
- **Benefit**: Reduces polygon count for distant objects

### Shadow Map Optimization
- **Fidelity-based**: 512, 1024, or 2048 resolution
- **Single light source**: Sun only
- **Static bodies**: Cached shadow maps
- **Benefit**: Reduces GPU load

### N-Body Optimization
- **Pairwise calculation**: O(n²) complexity
- **Skip zero-mass**: Kinematic bodies excluded
- **Distance cutoff**: Prevents singularities
- **Benefit**: Stable gravity with reasonable performance

## Extensibility Points

### Adding New Entity Types

1. **Asteroid Belt**:
   - Create `AsteroidBelt` class extending `CelestialBody`
   - Generate procedural asteroids
   - Apply orbit randomization

2. **Space Station**:
   - Static or orbital position
   - Interior collision mesh
   - Custom interaction logic

3. **Nebula**:
   - Particle system
   - Volumetric shader
   - Color gradients

### Custom Physics

1. **Magnetic Fields**:
   - Add to `PhysicsWorld.js`
   - Define field strength/direction
   - Apply force to magnetic objects

2. **Solar Wind**:
   - Radial force from sun
   - Affects light objects more
   - Variable intensity

3. **Tidal Forces**:
   - Calculate differential gravity
   - Apply torque to nearby bodies
   - Elongation effects

### Shader Extensions

1. **Atmospheric Scattering**:
   - Rayleigh scattering shader
   - Mie scattering for haze
   - Day/night terminator

2. **Ring Systems**:
   - Billboard particles
   - Alpha-blended texture
   - Shadow receiver

3. **Lava/Water Surfaces**:
   - Normal map animation
   - Reflectivity variation
   - Emission maps

## Memory Management

### Resource Lifecycle

```
Creation:
  Geometry → Material → Mesh → Scene
  Shape → Body → Physics World

Update:
  Frame loop (no allocation)

Disposal:
  scene.remove(mesh)
  geometry.dispose()
  material.dispose()
  physicsWorld.removeBody(body)
```

### Best Practices
- Reuse geometries when possible
- Share materials between similar objects
- Dispose resources on removal
- Avoid creating objects in update loops

---

**This architecture provides**:
- Clear separation of concerns
- Easy testing and debugging
- Extensibility for new features
- Performance optimization opportunities
