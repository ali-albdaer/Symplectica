import * as THREE from 'three';
import { CONFIG } from './config.js';

export class BodyManager {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.bodies = {};
    }

    init() {
        // Create Sun
        this.createBody('sun', CONFIG.bodies.sun);
        // Create Planet 1
        this.createBody('planet1', CONFIG.bodies.planet1);
        // Create Moon 1
        this.createBody('moon1', CONFIG.bodies.moon1);
        // Create Planet 2
        this.createBody('planet2', CONFIG.bodies.planet2);
    }

    createBody(id, config) {
        const geometry = new THREE.SphereGeometry(config.radius, 64, 64);
        let material;

        if (config.type === 'star') {
            material = new THREE.MeshBasicMaterial({ 
                color: config.color,
            });
            
            // Add light
            const light = new THREE.PointLight(0xffffff, config.lightIntensity, 0, 0);
            light.position.set(0, 0, 0);
            light.castShadow = true;
            light.shadow.mapSize.width = CONFIG.graphics.shadowMapSize;
            light.shadow.mapSize.height = CONFIG.graphics.shadowMapSize;
            light.shadow.camera.near = 100; // Adjust based on scale
            light.shadow.camera.far = 500000;
            light.shadow.bias = -0.0001;
            
            // Glow effect (simple sprite)
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: this.createGlowTexture(), 
                color: config.color, 
                transparent: true, 
                blending: THREE.AdditiveBlending 
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(config.radius * 4, config.radius * 4, 1.0);
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.add(light);
            mesh.add(sprite);
            
            this.setupBodyPhysics(id, config, mesh);
            this.scene.add(mesh);
            
        } else {
            material = new THREE.MeshStandardMaterial({
                color: config.color,
                roughness: 0.8,
                metalness: 0.1,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Atmosphere
            if (config.atmosphere) {
                const atmoGeo = new THREE.SphereGeometry(config.radius * config.atmosphere.scale, 64, 64);
                const atmoMat = new THREE.MeshPhongMaterial({
                    color: config.atmosphere.color,
                    transparent: true,
                    opacity: config.atmosphere.opacity,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                });
                const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
                mesh.add(atmoMesh);
            }

            this.setupBodyPhysics(id, config, mesh);
            this.scene.add(mesh);
        }
    }

    setupBodyPhysics(id, config, mesh) {
        const body = {
            id: id,
            mass: config.mass,
            radius: config.radius,
            position: { ...config.position },
            velocity: { ...config.velocity },
            rotationPeriod: config.rotationPeriod,
            mesh: mesh
        };
        
        // Set initial mesh position
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        
        this.physicsWorld.addBody(body);
        this.bodies[id] = body;
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    getBody(id) {
        return this.bodies[id];
    }

    update(dt) {
        for (const id in this.bodies) {
            const body = this.bodies[id];
            if (body.rotationPeriod && body.mesh) {
                const rotationSpeed = (2 * Math.PI) / body.rotationPeriod;
                body.mesh.rotation.y += rotationSpeed * dt;
            }
        }
    }
}
