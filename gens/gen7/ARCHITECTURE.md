# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SOLAR SYSTEM SIMULATION                          │
│                              Entry Point                                 │
│                            (index.html)                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      Main Application   │
                    │       (main.js)         │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────▼────┐            ┌─────▼─────┐          ┌──────▼──────┐
   │ Config  │            │  Systems  │          │  Game Loop  │
   │ globals │            │ Initialize│          │  60 FPS     │
   └─────────┘            └─────┬─────┘          └──────┬──────┘
                                │                       │
                    ┌───────────┼───────────┐          │
                    │           │           │          │
              ┌─────▼─────┐ ┌──▼──────┐ ┌─▼────────┐ │
              │ Renderer  │ │ Physics │ │ Lighting │ │
              │ (Three.js)│ │ Engine  │ │  System  │ │
              └─────┬─────┘ └──┬──────┘ └─┬────────┘ │
                    │          │           │          │
                    │          │           │          │
┌───────────────────┴──────────┴───────────┴──────────┴───────────────────┐
│                          GAME OBJECTS LAYER                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐         ┌──────────────────┐                      │
│  │ Celestial Bodies│         │  Player System   │                      │
│  ├─────────────────┤         ├──────────────────┤                      │
│  │                 │         │                  │                      │
│  │  ┌──────────┐   │         │  ┌───────────┐   │                      │
│  │  │   Star   │───┼─────────┼──│  Player   │   │                      │
│  │  │  (Sun)   │   │         │  │ Controller│   │                      │
│  │  └──────────┘   │         │  └─────┬─────┘   │                      │
│  │       │         │         │        │         │                      │
│  │  ┌────▼─────┐   │         │  ┌─────▼─────┐   │                      │
│  │  │  Planet  │   │         │  │  Camera   │   │                      │
│  │  │ Terra 1  │◄──┼─────────┼──│ Controller│   │                      │
│  │  └──────┬───┘   │         │  └───────────┘   │                      │
│  │         │       │         │        │         │                      │
│  │    ┌────▼───┐   │         │        │         │                      │
│  │    │  Moon  │   │         │        │         │                      │
│  │    │  Luna  │   │         │        │         │                      │
│  │    └────────┘   │         │        │         │                      │
│  │         │       │         │        │         │                      │
│  │  ┌──────▼───┐   │         │        │         │                      │
│  │  │  Planet  │   │         │        │         │                      │
│  │  │  Rust 2  │   │         │        │         │                      │
│  │  └──────────┘   │         │        │         │                      │
│  │                 │         │        │         │                      │
│  └─────────────────┘         └────────┼─────────┘                      │
│                                       │                                │
│  ┌────────────────────────────────────▼──────────────────────┐         │
│  │              Interactive Objects                           │         │
│  │  [Cube] [Sphere] [Cylinder] [Cube] [Sphere] ...          │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐            ┌──────▼──────┐
              │    UI     │            │   Debug     │
              │  System   │            │   Tools     │
              └─────┬─────┘            └──────┬──────┘
                    │                         │
        ┌───────────┼───────────┐            │
        │           │           │            │
   ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐  ┌───▼─────┐
   │   HUD   │ │  Dev   │ │  Perf   │  │ Console │
   │ Display │ │  Menu  │ │ Monitor │  │ Logging │
   └─────────┘ └────────┘ └─────────┘  └─────────┘


═══════════════════════════════════════════════════════════════════════════

                          DATA FLOW DIAGRAM

┌─────────────┐
│   CONFIG    │  Provides initial parameters
│ globals.js  │──────┐
└─────────────┘      │
                     ▼
              ┌──────────────┐
              │   PHYSICS    │  Calculates forces
              │   ENGINE     │  Updates positions
              └──────┬───────┘  Updates velocities
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Body 1 │  │ Body 2 │  │ Body N │  Game Objects
    │ Update │  │ Update │  │ Update │  Update state
    └───┬────┘  └───┬────┘  └───┬────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
              ┌──────────┐
              │  MESHES  │  Update positions
              │  UPDATE  │  Update rotations
              └─────┬────┘
                    ▼
              ┌──────────┐
              │ RENDERER │  Draw to screen
              │  RENDER  │  Apply lighting
              └─────┬────┘  Apply effects
                    ▼
              ┌──────────┐
              │  SCREEN  │
              │  OUTPUT  │
              └──────────┘


═══════════════════════════════════════════════════════════════════════════

                       PHYSICS ENGINE DETAIL

┌─────────────────────────────────────────────────────────────────────┐
│                      GRAVITY ENGINE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: Calculate Forces                                          │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  For each pair of bodies (i, j):                     │          │
│  │    direction = position[j] - position[i]             │          │
│  │    distance = |direction|                            │          │
│  │    force = G * mass[i] * mass[j] / distance²        │          │
│  │    apply force to both bodies (Newton's 3rd law)     │          │
│  └──────────────────────────────────────────────────────┘          │
│                          ▼                                          │
│  Step 2: Integration (Semi-Implicit Euler)                         │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  For each body:                                       │          │
│  │    acceleration = force / mass                        │          │
│  │    velocity += acceleration * deltaTime               │          │
│  │    position += velocity * deltaTime                   │          │
│  └──────────────────────────────────────────────────────┘          │
│                          ▼                                          │
│  Step 3: Collision Detection & Resolution                          │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  For each pair:                                       │          │
│  │    if distance < (radius[i] + radius[j]):            │          │
│  │      calculate impulse                                │          │
│  │      apply to both bodies                             │          │
│  │      separate objects                                 │          │
│  └──────────────────────────────────────────────────────┘          │
│                          ▼                                          │
│  Step 4: Update Statistics                                         │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Calculate total energy                               │          │
│  │  Calculate total momentum                             │          │
│  │  Track for debugging                                  │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════

                      CLASS HIERARCHY

                    ┌──────────────┐
                    │ PhysicsObject│  (Base Class)
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐    ┌──────▼──────┐
        │ CelestialBody  │    │   Player    │
        └───────┬────────┘    └─────────────┘
                │
        ┌───────┼────────┐
        │       │        │
   ┌────▼──┐ ┌─▼────┐ ┌─▼───┐
   │ Star  │ │Planet│ │Moon │
   └───────┘ └──────┘ └─────┘


═══════════════════════════════════════════════════════════════════════════

                      FILE DEPENDENCY GRAPH

globals.js ─────┐
                │
Vector3D.js ────┼──────> PhysicsObject.js
                │              │
                │              ├──────> CelestialBody.js
                │              │              │
                │              │              ├──> Star.js
                │              │              ├──> Planet.js
                │              │              └──> Moon.js
                │              │
                │              ├──────> Player.js
                │              │
                │              └──────> InteractiveObject.js
                │
                ├──────> GravityEngine.js
                │
                ├──────> Renderer.js
                │
                ├──────> LightingSystem.js
                │
                ├──────> Camera.js
                │
                ├──────> PerformanceMonitor.js
                │
                └──────> DevMenu.js
                         │
                         └──────> main.js ──> index.html


═══════════════════════════════════════════════════════════════════════════

                    RENDERING PIPELINE

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Scene   │───>│  Camera  │───>│ Lighting │───>│  Render  │
│  Update  │    │  Update  │    │  Update  │    │  Frame   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────┐
│  • Bodies update positions                              │
│  • Camera follows player                                │
│  • Lights track sun                                     │
│  • Shadows calculated                                   │
│  • Post-processing applied                              │
│  • Frame drawn to canvas                                │
└─────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════

```

This architecture provides:

✅ **Modularity** - Each system is independent
✅ **Scalability** - Easy to add new features
✅ **Maintainability** - Clear separation of concerns
✅ **Performance** - Optimized update loops
✅ **Debuggability** - Clear data flow
✅ **Extensibility** - Plugin-ready architecture
