/**
 * SolarSystemManager.js
 * Manages the creation and coordination of all celestial bodies.
 * Handles the solar system initialization with proper orbital mechanics.
 */

import * as THREE from 'three';
import { CELESTIAL_BODIES, PHYSICS, RENDER_SCALE, calculateOrbitalVelocity } from '../config/GlobalConfig.js';
import { CelestialBody } from './CelestialBody.js';
import { DebugLogger, loadingTracker } from '../utils/DebugLogger.js';

const logger = new DebugLogger('SolarSystem');

export class SolarSystemManager {
    constructor(physicsEngine, scene) {
        this.physics = physicsEngine;
        this.scene = scene;
        this.bodies = new Map();
        this.sun = null;
        this.playerSpawnBody = null;
        
        logger.info('Solar system manager initialized');
    }

    /**
     * Initialize the entire solar system
     */
    async init() {
        loadingTracker.startTask('solar-system', 'Initializing solar system');
        
        try {
            // Create bodies in order: sun first, then planets, then moons
            await this.createSun();
            await this.createPlanets();
            await this.createMoons();
            
            // Create starfield background
            this.createStarfield();
            
            // Validate orbital stability
            this.validateOrbits();
            
            loadingTracker.completeTask('solar-system', true);
            logger.info(`Solar system initialized with ${this.bodies.size} bodies`);
            
        } catch (error) {
            loadingTracker.completeTask('solar-system', false, error.message);
            logger.error('Failed to initialize solar system', error);
            throw error;
        }
        
        return this;
    }

    /**
     * Create the sun
     */
    async createSun() {
        loadingTracker.startTask('create-sun', 'Creating the Sun');
        
        const sunConfig = CELESTIAL_BODIES.sun;
        const sun = new CelestialBody(sunConfig, this.physics);
        await sun.init();
        
        this.scene.add(sun.getObject3D());
        this.bodies.set('sun', sun);
        this.sun = sun;
        
        logger.info('Sun created successfully');
        loadingTracker.completeTask('create-sun', true);
    }

    /**
     * Create all planets
     */
    async createPlanets() {
        loadingTracker.startTask('create-planets', 'Creating planets');
        
        const planetConfigs = Object.entries(CELESTIAL_BODIES).filter(
            ([key, body]) => body.type === 'planet'
        );
        
        for (const [key, config] of planetConfigs) {
            logger.info(`Creating planet: ${config.name}`);
            
            // Validate/recalculate orbital velocity for stability
            const expectedV = calculateOrbitalVelocity(CELESTIAL_BODIES.sun.mass, config.orbitalRadius);
            const currentV = Math.sqrt(
                config.velocity.x ** 2 + 
                config.velocity.y ** 2 + 
                config.velocity.z ** 2
            );
            
            // If velocity is significantly off, adjust it
            if (Math.abs(currentV - expectedV) / expectedV > 0.1) {
                logger.warn(`Adjusting ${config.name} velocity from ${currentV.toFixed(4)} to ${expectedV.toFixed(4)} km/s`);
                
                // Calculate velocity direction (perpendicular to position vector)
                const pos = config.position;
                const posLen = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
                
                // For a prograde orbit in the XZ plane
                config.velocity = {
                    x: -expectedV * (pos.z / posLen),
                    y: 0,
                    z: expectedV * (pos.x / posLen),
                };
            }
            
            const planet = new CelestialBody(config, this.physics);
            await planet.init();
            
            this.scene.add(planet.getObject3D());
            this.scene.add(planet.getOrbitLine());
            this.bodies.set(key, planet);
            
            // Mark player spawn body
            if (config.isPlayerSpawn) {
                this.playerSpawnBody = planet;
                logger.info(`Player spawn body: ${config.name}`);
            }
        }
        
        loadingTracker.completeTask('create-planets', true);
    }

    /**
     * Create all moons
     */
    async createMoons() {
        loadingTracker.startTask('create-moons', 'Creating moons');
        
        const moonConfigs = Object.entries(CELESTIAL_BODIES).filter(
            ([key, body]) => body.type === 'moon'
        );
        
        for (const [key, config] of moonConfigs) {
            logger.info(`Creating moon: ${config.name} orbiting ${config.parentBody}`);
            
            // Get parent body
            const parent = this.bodies.get(config.parentBody);
            if (!parent) {
                logger.error(`Parent body not found: ${config.parentBody}`);
                continue;
            }
            
            // Calculate absolute position and velocity from relative values
            const absoluteConfig = { ...config };
            absoluteConfig.position = {
                x: parent.position.x + config.relativePosition.x,
                y: parent.position.y + config.relativePosition.y,
                z: parent.position.z + config.relativePosition.z,
            };
            
            // Moon velocity is parent velocity + relative orbital velocity
            const expectedV = calculateOrbitalVelocity(parent.mass, 
                Math.sqrt(
                    config.relativePosition.x ** 2 + 
                    config.relativePosition.y ** 2 + 
                    config.relativePosition.z ** 2
                )
            );
            
            absoluteConfig.velocity = {
                x: parent.velocity.x + config.relativeVelocity.x,
                y: parent.velocity.y + config.relativeVelocity.y,
                z: parent.velocity.z + config.relativeVelocity.z,
            };
            
            const moon = new CelestialBody(absoluteConfig, this.physics);
            await moon.init();
            
            this.scene.add(moon.getObject3D());
            this.scene.add(moon.getOrbitLine());
            this.bodies.set(key, moon);
        }
        
        loadingTracker.completeTask('create-moons', true);
    }

    /**
     * Create starfield background
     */
    createStarfield() {
        loadingTracker.startTask('create-stars', 'Creating starfield');
        
        const starCount = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // Distribute stars on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5000 + Math.random() * 5000;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random star colors (mostly white, some blue/red)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            } else if (colorChoice < 0.85) {
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 1;
            } else {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.7;
                colors[i * 3 + 2] = 0.5;
            }
            
            sizes[i] = 0.5 + Math.random() * 1.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false,
        });
        
        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
        
        loadingTracker.completeTask('create-stars', true);
        logger.info(`Created starfield with ${starCount} stars`);
    }

    /**
     * Validate orbital stability
     */
    validateOrbits() {
        logger.info('Validating orbital stability...');
        
        for (const [key, body] of this.bodies) {
            if (body.type === 'planet' && this.sun) {
                const params = this.physics.getOrbitalParameters(
                    body.physicsBody,
                    this.sun.physicsBody
                );
                
                logger.info(`${body.name} orbital parameters:`, {
                    semiMajorAxis: `${(params.semiMajorAxis / 1e6).toFixed(2)} million km`,
                    eccentricity: params.eccentricity.toFixed(4),
                    period: `${(params.period / 86400).toFixed(2)} days`,
                    velocity: `${params.velocity.toFixed(4)} km/s`,
                });
                
                // Check for unstable orbits
                if (params.eccentricity > 0.9) {
                    logger.warn(`${body.name} may be in an unstable/escape orbit!`);
                }
            }
        }
    }

    /**
     * Get the player spawn body
     */
    getPlayerSpawnBody() {
        return this.playerSpawnBody;
    }

    /**
     * Get player spawn position (on the surface)
     */
    getPlayerSpawnPosition() {
        if (!this.playerSpawnBody) {
            logger.error('No player spawn body defined!');
            return { x: 0, y: 0, z: 0 };
        }
        
        // Spawn at the "top" of the planet (positive Y in local coords)
        const body = this.playerSpawnBody;
        const altitude = 0.01; // 10 meters above surface
        
        return body.getSurfacePosition(0, 0, altitude);
    }

    /**
     * Update all bodies
     */
    update(deltaTime, timeScale) {
        for (const [key, body] of this.bodies) {
            body.update(deltaTime, timeScale);
        }
    }

    /**
     * Get body by name
     */
    getBody(name) {
        return this.bodies.get(name);
    }

    /**
     * Get all bodies
     */
    getAllBodies() {
        return Array.from(this.bodies.values());
    }

    /**
     * Get nearest body to a position
     */
    getNearestBody(position) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const [key, body] of this.bodies) {
            const dx = body.position.x - position.x;
            const dy = body.position.y - position.y;
            const dz = body.position.z - position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = body;
            }
        }
        
        return { body: nearest, distance: minDist };
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        for (const [key, body] of this.bodies) {
            body.dispose();
        }
        this.bodies.clear();
        
        if (this.starfield) {
            this.starfield.geometry.dispose();
            this.starfield.material.dispose();
        }
        
        logger.info('Solar system disposed');
    }
}
