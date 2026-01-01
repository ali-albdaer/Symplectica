import { vec3FromConfig } from "../utils/MathUtils.js";

const THREE_REF = () => window.THREE;
const CANNON_REF = () => window.CANNON;

export class EntityFactory {
    constructor(sceneManager, physicsSystem, configManager, logger) {
        this.sceneManager = sceneManager;
        this.physics = physicsSystem;
        this.config = configManager;
        this.logger = logger;
        this.entities = new Map();
        this.lodEnabled = this.config.get("rendering.lodDistances").enabled;
        this.frustumEnabled = this.config.get("rendering.frustumCullingEnabled");
    }

    createAll() {
        const created = [];
        created.push(this.createSun(this.config.get("bodies.sun")));
        this.config.get("bodies.planets").forEach((planetCfg) => {
            created.push(this.createPlanet(planetCfg));
        });
        this.config.get("bodies.moons").forEach((moonCfg) => {
            created.push(this.createMoon(moonCfg));
        });
        this.config.get("bodies.micro").forEach((microCfg) => {
            created.push(this.createMicroBody(microCfg));
        });
        return created.filter(Boolean);
    }

    registerEntity(id, entity) {
        this.entities.set(id, entity);
        return entity;
    }

    rebuildCelestialMeshes({ lodEnabled }) {
        this.lodEnabled = lodEnabled;
        this.entities.forEach((entity) => {
            if (["planet", "moon"].indexOf(entity.type) === -1) {
                return;
            }
            const oldMesh = entity.mesh;
            const newMesh = this.createSphereMesh(entity.config, entity.type);
            newMesh.position.copy(oldMesh.position);
            newMesh.quaternion.copy(oldMesh.quaternion);
            newMesh.castShadow = true;
            newMesh.receiveShadow = true;
            this.sceneManager.worldRoot.remove(oldMesh);
            this.sceneManager.worldRoot.add(newMesh);
            entity.mesh = newMesh;
        });
    }

    createSun(config) {
        const THREE = THREE_REF();
        const CANNON = CANNON_REF();
        const geometry = new THREE.SphereGeometry(config.radius, config.segments, config.segments);
        const material = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: config.emissiveIntensity,
            metalness: 0.0,
            roughness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const body = new CANNON.Body({
            mass: config.mass,
            shape: new CANNON.Sphere(config.radius),
            position: new CANNON.Vec3(config.position.x, config.position.y, config.position.z)
        });
        body.velocity.set(config.velocity.x, config.velocity.y, config.velocity.z);
        body.linearDamping = 0;
        body.angularDamping = 0;
        const entity = { id: config.id, type: "sun", mesh, body, config };
        this.applyCullingPreference(mesh);
        this.sceneManager.worldRoot.add(mesh);
        this.sceneManager.attachSun(mesh);
        this.physics.addBody(config.id, body, { affectsGravity: false, receivesGravity: true, userData: entity });
        this.registerEntity(config.id, entity);
        return entity;
    }

    createPlanet(config) {
        return this.createCelestial(config, "planet");
    }

    createMoon(config) {
        return this.createCelestial(config, "moon");
    }

    createCelestial(config, type) {
        const THREE = THREE_REF();
        const CANNON = CANNON_REF();
        const mesh = this.createSphereMesh(config, type);
        const position = vec3FromConfig(config.position);
        const body = new CANNON.Body({
            mass: config.mass,
            shape: new CANNON.Sphere(config.radius),
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        body.velocity.set(config.velocity.x, config.velocity.y, config.velocity.z);
        body.angularDamping = 0.02;
        body.linearDamping = 0.0;
        body.userData = { type, config };
        const entity = { id: config.id, type, mesh, body, config };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.applyCullingPreference(mesh);
        this.sceneManager.worldRoot.add(mesh);
        this.physics.addBody(config.id, body, { affectsGravity: true, receivesGravity: true, userData: entity });
        this.registerEntity(config.id, entity);
        return entity;
    }

    createSphereMesh(config, type) {
        const THREE = THREE_REF();
        const lodConfig = this.config.get("rendering.lodDistances");
        const fidelityKey = this.config.get("rendering.fidelity");
        const distanceTiers = lodConfig[fidelityKey];
        const color = type === "planet" ? config.orbitColor : 0xb9b9b9;
        const baseSegments = config.segments;
        const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.0,
            roughness: 0.45
        });
        if (!this.lodEnabled) {
            const geometry = new THREE.SphereGeometry(config.radius, baseSegments, baseSegments);
            const mesh = new THREE.Mesh(geometry, material);
            this.applyCullingPreference(mesh);
            return mesh;
        }
        const lod = new THREE.LOD();
        const detailLevels = [
            { segments: baseSegments, distance: distanceTiers[0] },
            { segments: Math.max(16, Math.round(baseSegments * 0.6)), distance: distanceTiers[1] },
            { segments: Math.max(8, Math.round(baseSegments * 0.3)), distance: distanceTiers[1] * 2 }
        ];
        detailLevels.forEach(({ segments, distance }) => {
            const geometry = new THREE.SphereGeometry(config.radius, segments, segments);
            const mesh = new THREE.Mesh(geometry, material.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
             this.applyCullingPreference(mesh);
            lod.addLevel(mesh, distance);
        });
        this.applyCullingPreference(lod);
        return lod;
    }

    createMicroBody(config) {
        const THREE = THREE_REF();
        const CANNON = CANNON_REF();
        const geometry = new THREE.SphereGeometry(config.radius, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: config.color || 0xcccccc, metalness: 0.1, roughness: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const body = new CANNON.Body({
            mass: config.mass,
            shape: new CANNON.Sphere(config.radius),
            position: new CANNON.Vec3(config.position.x, config.position.y, config.position.z)
        });
        body.velocity.set(config.velocity.x, config.velocity.y, config.velocity.z);
        body.linearDamping = 0.05;
        body.angularDamping = 0.1;
        body.userData = { type: "micro", config };
        const entity = { id: config.id, type: "micro", mesh, body, config };
        this.applyCullingPreference(mesh);
        this.sceneManager.worldRoot.add(mesh);
        this.physics.addBody(config.id, body, { affectsGravity: true, receivesGravity: true, userData: entity });
        this.registerEntity(config.id, entity);
        return entity;
    }

    applyCullingPreference(object3d) {
        if (!object3d) {
            return;
        }
        object3d.traverse?.((node) => {
            if (node.isMesh) {
                node.frustumCulled = this.frustumEnabled;
            }
        });
        if (object3d.isMesh) {
            object3d.frustumCulled = this.frustumEnabled;
        }
    }

    updateFrustumCulling(enabled) {
        this.frustumEnabled = enabled;
        this.entities.forEach((entity) => {
            this.applyCullingPreference(entity.mesh);
        });
    }
}
