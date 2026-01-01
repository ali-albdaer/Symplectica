# System Architecture & Design Patterns

Comprehensive overview of the Solar System Simulation's architecture, design patterns, and internal systems.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GameEngine (main.js)                    │
│                   Game Loop Orchestrator                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─ update()
                              │   ├─ InputHandler.update()
                              │   ├─ Physics.update()
                              │   ├─ Entity.updateAll()
                              │   └─ Telemetry.update()
                              │
                              └─ render()
                                  └─ Renderer.render()
```

### Major Subsystems

1. **Input System** → Keyboard, Mouse, Gamepad
2. **Physics System** → N-body gravity, Cannon-es integration
3. **Entity System** → Objects, players, celestial bodies
4. **Rendering System** → Three.js, materials, lighting
5. **Camera System** → 1st/3rd person, smooth transitions
6. **Debug System** → Logging, console, telemetry

---

## Design Patterns Used

### 1. **Entity-Component Architecture**

Entities are base objects with optional components (physics, mesh, etc.).

```javascript
Entity {
    mesh: THREE.Mesh          // Rendering component
    physicsBody: Cannon.Body  // Physics component
    userData: object          // Custom data
}
```

**Benefits:**
- Flexible inheritance hierarchy
- Easy to extend with new entity types
- Physics and graphics loosely coupled

---

### 2. **Manager Pattern**

Central managers handle collections of objects.

```javascript
EntityManager      → Manages all entities
PhysicsEngine      → Manages physics bodies
Renderer           → Manages scene/materials
InputHandler       → Manages input state
DevConsole         → Manages debugging
```

**Benefits:**
- Single point of truth for each system
- Batch operations (updateAll, clear)
- Easy lifecycle management

---

### 3. **Configuration Pattern**

All constants centralized in `Config` object.

```javascript
Config.physics, Config.render, Config.player, etc.
```

**Benefits:**
- No magic numbers in code
- Easy parameter tweaking
- Live editing in dev console
- Data-driven design

---

### 4. **Strategy Pattern**

Camera modes and movement controllers.

```javascript
Camera {
    mode: 'firstperson' | 'thirdperson'
    updateFirstPerson()
    updateThirdPerson()
}

Player {
    freeFlyMode: boolean
    applyWalkMovement()
    applyFreeFlyMovement()
}
```

**Benefits:**
- Behavior switching at runtime
- Clean separation of concerns
- Extensible to new modes

---

### 5. **Observer Pattern**

Event subscriptions for logging and callbacks.

```javascript
DebugLog.subscribe(callback)  // Listen to all logs
Entity.onUpdate = callback     // Custom entity logic
Entity.onDestroy = callback    // Cleanup hook
```

**Benefits:**
- Decoupled event handling
- Extensible logging pipeline
- Custom entity behaviors

---

### 6. **Adapter Pattern**

Wrapper around Cannon-es physics engine.

```javascript
PhysicsEngine {
    world: Cannon.World
    bodies: Map<id, Cannon.Body>
    
    // Provides high-level interface
    addBody()
    applyForce()
    applyGravitationalForces()
}
```

**Benefits:**
- Hides physics library complexity
- Easy to swap implementations
- Custom gravity system layer

---

### 7. **Factory Pattern**

Entity creation helpers.

```javascript
EntityManager.create(config) → Entity
GameEngine.createCelestialBody(config) → CelestialBody
GameEngine.createInteractiveObject(config) → Entity
```

**Benefits:**
- Consistent object creation
- Centralized initialization logic
- Configuration-driven instantiation

---

## Data Flow Architecture

### Per-Frame Update Sequence

```
Frame Start
    │
    ├─ Input.update()
    │   └─ Update key states, mouse delta
    │
    ├─ GameEngine.update()
    │   ├─ getMovementInput()
    │   ├─ getLookInput()
    │   │
    │   ├─ Camera.update(player, input)
    │   │
    │   ├─ Player.setMovementInput()
    │   ├─ Player.applyMovement()
    │   │
    │   ├─ PhysicsEngine.applyGravitationalForces()
    │   │   └─ Calculate N-body forces
    │   │
    │   ├─ PhysicsEngine.update()
    │   │   └─ Cannon-es substep integration
    │   │
    │   ├─ EntityManager.updateAll()
    │   │   └─ Sync transforms: Physics → Mesh
    │   │
    │   └─ Telemetry.update()
    │
    └─ GameEngine.render()
        └─ Renderer.render(camera)
            └─ Three.js WebGL draw call
```

### Physics Update Loop (Substeps)

```
PhysicsEngine.update(deltaTime)
    │
    ├─ timeStep = deltaTime / substeps
    │
    └─ For substeps iterations:
        │
        ├─ Apply gravity forces to all bodies
        │   └─ For each pair: F = G*M1*M2/r²
        │
        ├─ Cannon.World.step(timeStep)
        │   ├─ Broad phase collision detection
        │   ├─ Narrow phase intersection tests
        │   ├─ Contact constraint solving
        │   └─ Velocity & position integration
        │
        └─ Update body states
```

### Entity Update Sequence

```
Entity.update(deltaTime)
    │
    ├─ [If physics-enabled]
    │   ├─ Sync from physics: position ← physicsBody.position
    │   └─ Sync velocity: velocity ← physicsBody.velocity
    │
    ├─ [Custom logic]
    │   ├─ CelestialBody: updateRotation()
    │   ├─ Player: applyMovement(), checkGround()
    │   └─ Entity.onUpdate callback
    │
    └─ [Render sync]
        └─ mesh.position ← entity.position
```

---

## Module Dependency Graph

```
index.html
    │
    ├─ Three.js (CDN)
    ├─ Cannon-es (CDN)
    │
    └─ debug-log.js (global error capture)
        │
        ├─ utilities.js (math, helpers)
        │
        ├─ config.js (constants)
        │   │
        │   └─ [used by all modules]
        │
        ├─ physics-engine.js
        │   ├─ cannon-es
        │   └─ utilities.js
        │
        ├─ entity.js
        │   ├─ utilities.js
        │   └─ config.js
        │
        ├─ celestial-body.js
        │   ├─ entity.js
        │   ├─ config.js
        │   └─ utilities.js
        │
        ├─ player.js
        │   ├─ entity.js
        │   ├─ physics-engine.js
        │   └─ config.js
        │
        ├─ camera.js
        │   ├─ config.js
        │   └─ utilities.js
        │
        ├─ input-handler.js
        │   ├─ config.js
        │   └─ debug-log.js
        │
        ├─ renderer.js
        │   ├─ Three.js
        │   └─ config.js
        │
        ├─ telemetry.js
        │   └─ config.js
        │
        ├─ dev-console.js
        │   ├─ debug-log.js
        │   └─ config.js
        │
        └─ main.js
            ├─ [imports all above]
            └─ Creates GameEngine singleton
```

**Circular Dependencies:** None (clean architecture)

---

## State Management

### Global State

```javascript
window.game              // GameEngine singleton
window.DebugLog         // Logger singleton
window.Config           // Configuration object
window.InputHandler     // Input singleton (for controls)
window.DevConsole       // Debug console singleton
```

### Local State (per system)

```
Player:
  ├─ freeFlyMode: boolean
  ├─ isGrounded: boolean
  ├─ heldObject: object
  └─ moveInput: Vector3

Camera:
  ├─ mode: string
  ├─ pitch, yaw: number
  └─ transitionProgress: number

InputHandler:
  ├─ isLocked: boolean
  ├─ keys: Map<key, pressed>
  └─ mouseDelta: {x, y}

PhysicsEngine:
  ├─ bodies: Map<id, Body>
  └─ forceAccumulators: Map<id, Vector3>
```

---

## Physics System Details

### Gravitational Force Calculation

**Algorithm: Brute-Force N-Body**

```
For each entity i:
    For each entity j (where j > i):
        direction = position_j - position_i
        distance = length(direction)
        
        if distance > epsilon:
            forceMagnitude = G * (mass_i * mass_j) / distance²
            force_vector = normalize(direction) * forceMagnitude
            
            // Newton's 3rd law
            velocity_i += force_vector / mass_i * dt
            velocity_j -= force_vector / mass_j * dt
```

**Complexity:** O(n²) per frame
**Optimization Potential:** Space partitioning (octree), SIMD, GPU compute

### Substep Integration

For stability with large bodies, physics is substep-integrated:

```javascript
deltaTime = frame_time / Config.physics.substeps

for each substep:
    applyGravitationalForces()
    cannon.world.step(deltaTime)
```

**Benefits:**
- Better numerical stability
- Prevents tunneling through objects
- More accurate large-mass interactions

### Stability Analysis

For Earth-Moon system (scaled):

- **Earth Mass:** 5.972e24 kg
- **Moon Mass:** 7.342e22 kg
- **Distance:** 384,400 km → 384.4 scene units (0.001 scale)
- **Orbital Velocity:** ~1.022 km/s → 0.001022 scene units/frame

**Stability Metric:** Energy conservation (kinetic + potential) should remain within ±5% over 100 frames.

---

## Rendering Pipeline

### Depth-First Render Order

```
Three.js Renderer
    │
    ├─ Clear framebuffer (black)
    │
    ├─ Render shadow map (from Sun light)
    │   └─ Depth only, no colors
    │
    ├─ Main render pass
    │   ├─ For each CelestialBody
    │   │   ├─ Check frustum culling
    │   │   ├─ Select LOD geometry
    │   │   ├─ Apply material
    │   │   ├─ Bind shadow map
    │   │   └─ Draw mesh
    │   │
    │   ├─ For each interactive object
    │   │   └─ [same process]
    │   │
    │   └─ For each special entity
    │       └─ [custom rendering]
    │
    └─ Post-processing (none currently)
```

### Material Assignment Logic

```javascript
if (fidelity === 'ultra') {
    // Use MeshStandardMaterial (PBR)
    {
        color, roughness, metalness, emissive
        map for textures (future)
    }
} else if (fidelity === 'low') {
    // Use MeshLambertMaterial (simple diffuse)
    {
        color, emissive
        fast, low-quality
    }
} else {
    // Medium: MeshPhongMaterial (Blinn-Phong)
    {
        color, shininess, emissive
        balanced quality/performance
    }
}
```

### Shadow Mapping

```
Shadow Map Generation (depth pass)
    │
    ├─ Render scene from Sun light perspective
    ├─ Store depth values in texture
    ├─ Resolution: Config.render.shadowMapSize
    │
Main Render Pass
    │
    ├─ Compare fragment depth to shadow map
    ├─ If depth_fragment > depth_map: in shadow (darker)
    ├─ Else: lit (bright)
    │
    └─ Blend with ambient light (black by default)
```

**Shadow Artifacts:** 
- Acne (self-shadowing): Mitigated with bias
- Aliasing: Use PCFShadowShadowMap (3x3 filter)
- Cascade limits: Ultra mode can use multiple cascades

---

## Input Event Handling

### Pointer Lock Flow

```
User clicks canvas
    │
    └─ !DevConsole.isOpen?
        ├─ Yes: RequestPointerLock()
        │   └─ OS grants exclusive mouse control
        │
        └─ No: Keep cursor visible
```

### Input Processing

```
Per frame:

InputHandler.update()
    ├─ Process keyboard state
    │   └─ Update keysPressed, keysReleased maps
    │
    ├─ Retrieve mouse delta (clamped by OS)
    │   └─ Reset mouseDeltaX/Y for next frame
    │
    └─ Poll gamepad (if enabled)
        └─ Update button/axis states

GameEngine.update()
    ├─ getMovementInput()
    │   ├─ Check WASD keys
    │   ├─ Add gamepad left stick
    │   └─ Return normalized vector
    │
    └─ getLookInput()
        ├─ Get mouse delta
        ├─ Add gamepad right stick * sensitivity
        └─ Return accumulated input
```

---

## Camera System

### First-Person Implementation

```
Position update:
    cameraPos = playerEyePos
    cameraPos += offset (0, 0, 0 for FP)

Rotation update:
    pitch = clamp(pitch + lookInput.y, -π/2, π/2)
    yaw += lookInput.x
    
    Create rotation matrix from (yaw, pitch)
    Apply to camera quaternion
```

### Third-Person Implementation

```
Calculate camera direction:
    direction = normalize(vec3(sin(yaw), 0, cos(yaw)))

Calculate camera position:
    offset = direction * distance + up * height
    targetPos = playerPos + offset

Smooth follow:
    currentPos.lerp(targetPos, dampingFactor)

Look-at:
    lookPoint = playerPos + direction * lookAhead + up * eyeHeight
    camera.lookAt(lookPoint)
```

**Transition:** Lerp between FP and TP positions/rotations over 0.5s

---

## Special Entity Extensions

### Blackhole

```javascript
Blackhole extends CelestialBody

Properties:
    schwarzschildRadius = 2*G*M/c²
    eventHorizonColor
    accretionDiskRadiusScale

Rendering:
    ├─ Event horizon (dark sphere)
    ├─ Accretion disk (glowing torus)
    └─ Warping effects (future)

Physics:
    └─ Tidal force calculation
        └─ spaghettificationForce ∝ M*r / d³
```

### VolumetricObject

```javascript
VolumetricObject extends Entity

Rendering:
    ├─ Particle cloud (Points geometry)
    ├─ Spherical distribution
    └─ Gradient opacity (density falloff)

Use cases:
    ├─ Nebulae
    ├─ Dust clouds
    └─ Energy halos
```

---

## Error Handling Strategy

### Error Capture Layers

```
Layer 1: Uncaught exceptions
    └─ window.addEventListener('error')
        └─ Display in DebugOverlay

Layer 2: Unhandled promise rejections
    └─ window.addEventListener('unhandledrejection')

Layer 3: Manual error logging
    └─ DebugLog.error(message)
        ├─ Console.error()
        ├─ DevConsole display
        └─ On-screen debug overlay
```

### Error Display

```
If initialization fails:
    ├─ Catch in GameEngine constructor
    ├─ Display critical error overlay
    └─ Show stack trace and message

If runtime error:
    ├─ Capture in DebugLog handler
    ├─ Log to console + dev console
    ├─ Display in debug overlay (if enabled)
    └─ Continue simulation (unless fatal)
```

---

## Performance Optimization Roadmap

### Current (Implemented)

✓ Frustum culling (optional)
✓ LOD system (optional, disabled by default)
✓ Fidelity levels
✓ Shadow map resolution control
✓ Input batching

### Planned Improvements

- [ ] Octree spatial partitioning for physics
- [ ] GPU compute for N-body forces
- [ ] Texture atlasing
- [ ] Instanced rendering for similar objects
- [ ] Web Workers for physics calculation
- [ ] Progressive shadow map updates
- [ ] Asset streaming for distant objects

---

## Extensibility Points

### Adding Custom Entity Types

1. **Extend base class:**
   ```javascript
   class MyEntity extends Entity { }
   ```

2. **Implement createMesh():**
   ```javascript
   createMesh() { /* geometry + material */ }
   ```

3. **Override update():**
   ```javascript
   update(deltaTime) { /* custom logic */ }
   ```

4. **Register with EntityManager:**
   ```javascript
   entityManager.create(config)
   ```

### Custom Physics

1. **Per-frame force application:**
   ```javascript
   physicsEngine.applyForce(entityId, force)
   ```

2. **Or integrate into main loop:**
   ```javascript
   // In GameEngine.update()
   for (entity of specialEntities) {
       applyCustomForce(entity)
   }
   ```

### Rendering Enhancements

1. **Post-processing:**
   ```javascript
   renderer.composer = new EffectComposer(renderer)
   renderer.composer.addPass(new ShaderPass(...))
   ```

2. **Custom materials:**
   ```javascript
   new THREE.ShaderMaterial({
       vertexShader, fragmentShader
   })
   ```

---

## Testing Strategy

### Unit Tests (Not Implemented)

```javascript
// Would test individual functions
test('Utilities.math.clamp', () => {
    assert(Utilities.math.clamp(5, 0, 10) === 5)
    assert(Utilities.math.clamp(-5, 0, 10) === 0)
})
```

### Integration Tests

Manual testing via dev console:
```javascript
// Test physics
Config.physics.timeScale = 100
// Watch orbits for stability

// Test input
game.player.position.y += 100
// Verify gravity pulls player down

// Test rendering
Config.render.fidelity = 'ultra'
// Verify visual quality increase
```

### Performance Profiling

Use Chrome DevTools:
1. **Performance tab:** Frame timeline, long tasks
2. **Rendering tab:** Paint profiler, layer compositor
3. **Memory tab:** Heap snapshots, memory leaks

---

## Security Considerations

- **No user input validation** (this is a local simulation)
- **eval() in dev console** (developer-only feature)
- **No network requests** (all local processing)
- **WebGL shader injection** (mitigated by using THREE.js)

---

## Summary

This architecture provides:
- **Modularity:** Clear separation of concerns
- **Extensibility:** Easy to add new entity types and behaviors
- **Performance:** LOD, frustum culling, fidelity levels
- **Debuggability:** Comprehensive logging and dev console
- **Stability:** N-body physics with substep integration

The design prioritizes **simplicity and clarity** while maintaining room for optimization and enhancement.

