import * as THREE from 'three';
import { Config } from './config.js';

export class World {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.bodies = [];
        
        this.init();
    }

    init() {
        this.createSun();
        this.createPlanets();
        this.createInteractiveObjects();
        this.createBackground();
    }

    createInteractiveObjects() {
        const cfg = Config.world;
        const G = Config.physics.G;
        const v1 = Math.sqrt((G * cfg.sunMass) / cfg.planet1Distance);
        
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        for (let i = 0; i < 10; i++) {
            const mesh = new THREE.Mesh(boxGeo, boxMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(
                    cfg.planet1Distance + (Math.random() - 0.5) * 10,
                    cfg.planet1Size + 5 + i * 2,
                    (Math.random() - 0.5) * 10
                ),
                velocity: new CANNON.Vec3(0, 0, v1)
            });
            body.addShape(shape);
            this.physics.addDynamicBody(body, mesh);
        }
    }

    createSun() {
        const cfg = Config.world;
        const geometry = new THREE.SphereGeometry(cfg.sunSize, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Emissive
        const sunMesh = new THREE.Mesh(geometry, material);
        
        // Sun Light
        const light = new THREE.PointLight(0xffffff, 2, 0, 0);
        light.position.set(0, 0, 0);
        light.castShadow = Config.graphics.enableShadows;
        light.shadow.mapSize.width = Config.graphics.shadowMapSize;
        light.shadow.mapSize.height = Config.graphics.shadowMapSize;
        light.shadow.bias = Config.graphics.shadowBias;
        
        sunMesh.add(light);
        this.scene.add(sunMesh);

        // Physics (Sun is static or very heavy)
        this.physics.addCelestialBody(sunMesh, cfg.sunMass, cfg.sunSize, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    }

    createPlanets() {
        const cfg = Config.world;
        const G = Config.physics.G;

        // Helper to calculate orbital velocity for circular orbit: v = sqrt(GM/r)
        const getOrbitalVelocity = (massCentral, distance) => {
            return Math.sqrt((G * massCentral) / distance);
        };

        // Planet 1
        const p1Geo = new THREE.SphereGeometry(cfg.planet1Size, 32, 32);
        const p1Mat = new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.8 });
        const p1Mesh = new THREE.Mesh(p1Geo, p1Mat);
        p1Mesh.castShadow = true;
        p1Mesh.receiveShadow = true;
        this.scene.add(p1Mesh);

        const v1 = getOrbitalVelocity(cfg.sunMass, cfg.planet1Distance);
        this.physics.addCelestialBody(p1Mesh, cfg.planet1Mass, cfg.planet1Size, new THREE.Vector3(cfg.planet1Distance, 0, 0), new THREE.Vector3(0, 0, v1));

        // Moon of Planet 1
        const mGeo = new THREE.SphereGeometry(cfg.moonSize, 16, 16);
        const mMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        mMesh.castShadow = true;
        mMesh.receiveShadow = true;
        this.scene.add(mMesh);

        const vMoon = getOrbitalVelocity(cfg.planet1Mass, cfg.moonDistance);
        // Moon velocity = Planet Velocity + Moon Orbital Velocity
        this.physics.addCelestialBody(mMesh, cfg.moonMass, cfg.moonSize, new THREE.Vector3(cfg.planet1Distance + cfg.moonDistance, 0, 0), new THREE.Vector3(0, 0, v1 + vMoon));

        // Planet 2
        const p2Geo = new THREE.SphereGeometry(cfg.planet2Size, 32, 32);
        const p2Mat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.6 });
        const p2Mesh = new THREE.Mesh(p2Geo, p2Mat);
        p2Mesh.castShadow = true;
        p2Mesh.receiveShadow = true;
        this.scene.add(p2Mesh);

        const v2 = getOrbitalVelocity(cfg.sunMass, cfg.planet2Distance);
        this.physics.addCelestialBody(p2Mesh, cfg.planet2Mass, cfg.planet2Size, new THREE.Vector3(-cfg.planet2Distance, 0, 0), new THREE.Vector3(0, 0, -v2));
    }

    createBackground() {
        // Simple starfield
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 10000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(20000));
            vertices.push(THREE.MathUtils.randFloatSpread(20000));
            vertices.push(THREE.MathUtils.randFloatSpread(20000));
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }
}