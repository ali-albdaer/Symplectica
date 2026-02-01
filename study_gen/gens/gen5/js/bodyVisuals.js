/**
 * bodyVisuals.js - Visual Representations of Celestial Bodies
 * 
 * Creates and manages Three.js meshes for each body type.
 * Handles:
 * - Mesh creation with appropriate geometry and materials
 * - Visual updates (position sync, trail rendering)
 * - Type-specific effects (star glow, pulsar beams)
 */

import * as THREE from 'three';
import { getRenderer } from './renderer.js';
import { getSimulation } from './simulation.js';
import { getState } from './state.js';
import { BodyType, isLuminous, isCompactObject } from './body.js';
import { AU, SOLAR_RADIUS } from './constants.js';

/**
 * Minimum visual radius to ensure visibility (in render units)
 * This is about 0.1% of AU at default view scale, so planets are always visible
 */
const MIN_VISUAL_RADIUS = 0.05;

/**
 * Base scale multiplier for body display size
 * Larger values make bodies more visible without affecting physics
 */
const DISPLAY_SCALE_FACTOR = 50;

/**
 * Maximum trail points for performance
 */
const MAX_TRAIL_POINTS = 500;

/**
 * Color palette for body types
 */
const BODY_COLORS = {
    [BodyType.STAR]: 0xffdd44,
    [BodyType.PLANET]: 0x4488ff,
    [BodyType.MOON]: 0xaabbcc,
    [BodyType.COMET]: 0x88ffff,
    [BodyType.SPACESHIP]: 0xff88ff,
    [BodyType.BLACK_HOLE]: 0x000000,
    [BodyType.NEUTRON_STAR]: 0x44ffff,
    [BodyType.PULSAR]: 0xffff44,
    [BodyType.MAGNETAR]: 0xff44ff,
};

/**
 * Create a visual mesh for a body
 * @param {Body} body - The body to create visuals for
 * @param {number} viewScale - Current view scale (meters per unit)
 * @returns {THREE.Object3D} The created mesh or group
 */
export function createBodyMesh(body, viewScale) {
    // Get state for user-adjustable scale
    const state = getState();
    const userScale = state.bodyScale || 1;
    
    // Calculate visual radius with display scaling
    // Physical radius is preserved in body.radius, this is ONLY for display
    let visualRadius = body.radius / viewScale;
    
    // Apply logarithmic scaling to make small bodies visible
    // This doesn't affect physics, only rendering
    if (body.type !== BodyType.STAR) {
        // For planets/moons: use sqrt scaling to compress the huge range
        // Earth radius (6.4e6m) vs AU (1.5e11m) = 4 orders of magnitude difference
        const scaledRadius = Math.sqrt(body.radius) * DISPLAY_SCALE_FACTOR / viewScale;
        visualRadius = Math.max(scaledRadius, MIN_VISUAL_RADIUS);
    } else {
        // Stars: also boost but less aggressively
        visualRadius = Math.max(visualRadius * 10, MIN_VISUAL_RADIUS * 3);
    }
    
    // Apply user scale multiplier
    visualRadius *= userScale;
    
    // Ensure minimum visibility
    if (visualRadius < MIN_VISUAL_RADIUS) {
        visualRadius = MIN_VISUAL_RADIUS;
    }
    
    // Cap maximum visual size to prevent overwhelming display
    const maxRadius = AU / viewScale / 5;
    if (visualRadius > maxRadius) {
        visualRadius = maxRadius;
    }
    
    // Create mesh based on body type
    let mesh;
    
    switch (body.type) {
        case BodyType.STAR:
            mesh = createStarMesh(body, visualRadius);
            break;
        case BodyType.BLACK_HOLE:
            mesh = createBlackHoleMesh(body, visualRadius, viewScale);
            break;
        case BodyType.NEUTRON_STAR:
        case BodyType.PULSAR:
        case BodyType.MAGNETAR:
            mesh = createNeutronStarMesh(body, visualRadius);
            break;
        case BodyType.COMET:
            mesh = createCometMesh(body, visualRadius);
            break;
        default:
            mesh = createPlanetMesh(body, visualRadius);
    }
    
    // Store body ID in mesh for raycasting
    mesh.userData.bodyId = body.id;
    mesh.name = `body-${body.id}`;
    
    // Set initial position
    updateBodyMeshPosition(mesh, body, viewScale);
    
    return mesh;
}

/**
 * Create a star mesh with glow
 * @param {Body} body - Star body
 * @param {number} radius - Visual radius
 * @returns {THREE.Group} Star mesh group
 */
function createStarMesh(body, radius) {
    const group = new THREE.Group();
    
    // Core sphere
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: body.color,
    });
    const coreMesh = new THREE.Mesh(geometry, material);
    group.add(coreMesh);
    
    // Glow sprite
    const glowSize = radius * 4;
    const glowTexture = createGlowTexture(body.color);
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: body.color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(glowSize, glowSize, 1);
    group.add(glowSprite);
    
    // Add point light
    const light = new THREE.PointLight(body.color, 1, 0, 2);
    light.castShadow = true;
    group.add(light);
    
    return group;
}

/**
 * Create a planet mesh
 * @param {Body} body - Planet body
 * @param {number} radius - Visual radius
 * @returns {THREE.Mesh} Planet mesh
 */
function createPlanetMesh(body, radius) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    
    const material = new THREE.MeshStandardMaterial({
        color: body.color,
        roughness: 0.8,
        metalness: 0.1,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add atmosphere if applicable
    if (body.hasAtmosphere) {
        const atmosGeometry = new THREE.SphereGeometry(radius * 1.02, 32, 32);
        const atmosMaterial = new THREE.MeshBasicMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide,
        });
        const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
        mesh.add(atmosphere);
    }
    
    return mesh;
}

/**
 * Create a black hole mesh with accretion disk visual
 * @param {Body} body - Black hole body
 * @param {number} radius - Visual radius (event horizon)
 * @param {number} viewScale - View scale
 * @returns {THREE.Group} Black hole visual group
 */
function createBlackHoleMesh(body, radius, viewScale) {
    const group = new THREE.Group();
    
    // Event horizon (pure black sphere)
    const horizonGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const horizonMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
    });
    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    group.add(horizon);
    
    // Photon sphere ring (at 1.5 * rs)
    const photonRadius = radius * 1.5;
    const ringGeometry = new THREE.TorusGeometry(photonRadius, radius * 0.1, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.5,
    });
    const photonRing = new THREE.Mesh(ringGeometry, ringMaterial);
    photonRing.rotation.x = Math.PI / 2;
    group.add(photonRing);
    
    // Accretion disk (simplified)
    const diskGeometry = new THREE.RingGeometry(radius * 2, radius * 6, 64);
    const diskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.rotation.x = Math.PI / 2;
    group.add(disk);
    
    // Gravitational lensing effect (visual only - distortion ring)
    const lensRadius = radius * 3;
    const lensGeometry = new THREE.RingGeometry(lensRadius * 0.9, lensRadius * 1.1, 64);
    const lensMaterial = new THREE.MeshBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
    });
    const lensRing = new THREE.Mesh(lensGeometry, lensMaterial);
    lensRing.rotation.x = Math.PI / 2;
    group.add(lensRing);
    
    return group;
}

/**
 * Create a neutron star/pulsar/magnetar mesh
 * @param {Body} body - Neutron star body
 * @param {number} radius - Visual radius
 * @returns {THREE.Group} Neutron star visual group
 */
function createNeutronStarMesh(body, radius) {
    const group = new THREE.Group();
    
    // Core - very bright, small
    // Use larger visual radius for visibility since neutron stars are tiny
    const visualRadius = Math.max(radius, MIN_VISUAL_RADIUS * 2);
    
    const coreGeometry = new THREE.SphereGeometry(visualRadius, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: body.color,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);
    
    // Intense glow
    const glowSize = visualRadius * 8;
    const glowTexture = createGlowTexture(body.color);
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: body.color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(glowSize, glowSize, 1);
    group.add(glowSprite);
    
    // Add pulsar beams if pulsar or magnetar
    if (body.type === BodyType.PULSAR || body.type === BodyType.MAGNETAR) {
        const beamLength = visualRadius * 20;
        const beamWidth = visualRadius * 2;
        
        // Two opposite beams
        const beamGeometry = new THREE.ConeGeometry(beamWidth, beamLength, 16, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: body.type === BodyType.MAGNETAR ? 0xff00ff : 0xffff00,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
        });
        
        const beam1 = new THREE.Mesh(beamGeometry, beamMaterial);
        beam1.position.y = beamLength / 2;
        beam1.name = 'beam1';
        group.add(beam1);
        
        const beam2 = new THREE.Mesh(beamGeometry, beamMaterial);
        beam2.position.y = -beamLength / 2;
        beam2.rotation.x = Math.PI;
        beam2.name = 'beam2';
        group.add(beam2);
    }
    
    // Point light
    const light = new THREE.PointLight(body.color, 0.5, 0, 2);
    group.add(light);
    
    return group;
}

/**
 * Create a comet mesh with tail
 * @param {Body} body - Comet body
 * @param {number} radius - Visual radius
 * @returns {THREE.Group} Comet visual group
 */
function createCometMesh(body, radius) {
    const group = new THREE.Group();
    
    // Nucleus (irregular shape approximation)
    const nucleusGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 1.0,
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    group.add(nucleus);
    
    // Coma (gas cloud around nucleus)
    const comaGeometry = new THREE.SphereGeometry(radius * 3, 16, 16);
    const comaMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffff,
        transparent: true,
        opacity: 0.3,
    });
    const coma = new THREE.Mesh(comaGeometry, comaMaterial);
    group.add(coma);
    
    // Tail placeholder (will be updated based on position relative to star)
    const tailLength = radius * 30 * (body.tailLength || 1);
    const tailGeometry = new THREE.ConeGeometry(radius * 2, tailLength, 8, 1, true);
    const tailMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.x = tailLength / 2;
    tail.rotation.z = -Math.PI / 2;
    tail.name = 'tail';
    group.add(tail);
    
    return group;
}

/**
 * Create a glow texture for stars
 * @param {number} color - Color in hex
 * @returns {THREE.CanvasTexture} Glow texture
 */
function createGlowTexture(color = 0xffffff) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    
    // Convert hex color to RGB
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

/**
 * Update a body mesh position from physics state
 * @param {THREE.Object3D} mesh - The mesh to update
 * @param {Body} body - The body with current position
 * @param {number} viewScale - Current view scale
 */
export function updateBodyMeshPosition(mesh, body, viewScale) {
    mesh.position.set(
        body.position.x / viewScale,
        body.position.y / viewScale,
        body.position.z / viewScale
    );
}

/**
 * Update pulsar rotation based on physics time
 * @param {THREE.Object3D} mesh - The pulsar mesh group
 * @param {Body} body - The pulsar body
 * @param {number} time - Current simulation time
 */
export function updatePulsarRotation(mesh, body, time) {
    if (body.type !== BodyType.PULSAR && body.type !== BodyType.MAGNETAR) {
        return;
    }
    
    const rotationAngle = (time / body.rotationPeriod) * Math.PI * 2;
    mesh.rotation.y = rotationAngle;
    
    // Update beam visibility based on phase (simple on/off pulsing)
    const phase = (rotationAngle % (Math.PI * 2)) / (Math.PI * 2);
    const beamVisible = phase < 0.5;
    
    mesh.children.forEach(child => {
        if (child.name === 'beam1' || child.name === 'beam2') {
            child.visible = beamVisible;
        }
    });
}

/**
 * Create or update trail line for a body
 * @param {Body} body - The body
 * @param {number} viewScale - Current view scale
 * @returns {THREE.Line|null} Trail line or null if no trail
 */
export function createTrailLine(body, viewScale) {
    if (body.trail.length < 2) {
        return null;
    }
    
    const points = [];
    const maxPoints = Math.min(body.trail.length, MAX_TRAIL_POINTS);
    const step = body.trail.length > MAX_TRAIL_POINTS 
        ? Math.floor(body.trail.length / MAX_TRAIL_POINTS) 
        : 1;
    
    for (let i = 0; i < body.trail.length; i += step) {
        const pos = body.trail[i];
        points.push(new THREE.Vector3(
            pos.x / viewScale,
            pos.y / viewScale,
            pos.z / viewScale
        ));
    }
    
    // Always include the last point
    const lastPos = body.trail[body.trail.length - 1];
    points.push(new THREE.Vector3(
        lastPos.x / viewScale,
        lastPos.y / viewScale,
        lastPos.z / viewScale
    ));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
        color: body.color,
        transparent: true,
        opacity: 0.5,
    });
    
    const line = new THREE.Line(geometry, material);
    line.userData.bodyId = body.id;
    line.name = `trail-${body.id}`;
    
    return line;
}

/**
 * Update trail line geometry
 * @param {THREE.Line} line - Existing trail line
 * @param {Body} body - The body
 * @param {number} viewScale - Current view scale
 */
export function updateTrailLine(line, body, viewScale) {
    if (body.trail.length < 2) {
        return;
    }
    
    const points = [];
    const maxPoints = Math.min(body.trail.length, MAX_TRAIL_POINTS);
    const step = body.trail.length > MAX_TRAIL_POINTS 
        ? Math.floor(body.trail.length / MAX_TRAIL_POINTS) 
        : 1;
    
    for (let i = 0; i < body.trail.length; i += step) {
        const pos = body.trail[i];
        points.push(new THREE.Vector3(
            pos.x / viewScale,
            pos.y / viewScale,
            pos.z / viewScale
        ));
    }
    
    // Always include the last point
    const lastPos = body.trail[body.trail.length - 1];
    points.push(new THREE.Vector3(
        lastPos.x / viewScale,
        lastPos.y / viewScale,
        lastPos.z / viewScale
    ));
    
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * Sync all body visuals with simulation state
 */
export function syncBodyVisuals() {
    const renderer = getRenderer();
    const simulation = getSimulation();
    const state = getState();
    const viewScale = renderer.viewScale;
    
    // Track which bodies exist
    const currentBodyIds = new Set(simulation.bodies.map(b => b.id));
    
    // Remove meshes for deleted bodies
    renderer.bodyMeshes.forEach((mesh, bodyId) => {
        if (!currentBodyIds.has(bodyId)) {
            renderer.bodiesGroup.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            renderer.bodyMeshes.delete(bodyId);
        }
    });
    
    // Remove trails for deleted bodies
    renderer.trailLines.forEach((line, bodyId) => {
        if (!currentBodyIds.has(bodyId)) {
            renderer.trailsGroup.remove(line);
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
            renderer.trailLines.delete(bodyId);
        }
    });
    
    // Update or create meshes for existing bodies
    for (const body of simulation.bodies) {
        let mesh = renderer.bodyMeshes.get(body.id);
        
        // Create mesh if it doesn't exist
        if (!mesh) {
            mesh = createBodyMesh(body, viewScale);
            renderer.bodiesGroup.add(mesh);
            renderer.bodyMeshes.set(body.id, mesh);
        }
        
        // Update position
        updateBodyMeshPosition(mesh, body, viewScale);
        
        // Update pulsar rotation
        if (body.type === BodyType.PULSAR || body.type === BodyType.MAGNETAR) {
            updatePulsarRotation(mesh, body, simulation.time);
        }
        
        // Update selection visual
        // (Add outline or glow for selected body)
        if (body.isSelected) {
            mesh.scale.setScalar(1.1);
        } else {
            mesh.scale.setScalar(1.0);
        }
        
        // Update trails
        if (state.showTrails && body.trail.length >= 2) {
            let trail = renderer.trailLines.get(body.id);
            
            if (!trail) {
                trail = createTrailLine(body, viewScale);
                if (trail) {
                    renderer.trailsGroup.add(trail);
                    renderer.trailLines.set(body.id, trail);
                }
            } else {
                updateTrailLine(trail, body, viewScale);
            }
        }
    }
}

/**
 * Initialize body visuals system (no-op for now, but provides consistent interface)
 */
export function initBodyVisuals() {
    // Future: could pre-cache geometries and materials here
}

/**
 * Update all trails (call each frame when trails are visible)
 */
export function updateTrails() {
    const renderer = getRenderer();
    const simulation = getSimulation();
    const state = getState();
    const viewScale = renderer.viewScale;
    
    for (const body of simulation.bodies) {
        if (body.trail.length >= 2) {
            let trail = renderer.trailLines.get(body.id);
            
            if (!trail) {
                trail = createTrailLine(body, viewScale);
                if (trail) {
                    renderer.trailsGroup.add(trail);
                    renderer.trailLines.set(body.id, trail);
                }
            } else {
                updateTrailLine(trail, body, viewScale);
            }
        }
    }
}

export default {
    createBodyMesh,
    updateBodyMeshPosition,
    updatePulsarRotation,
    createTrailLine,
    updateTrailLine,
    syncBodyVisuals,
    initBodyVisuals,
    updateTrails,
};
