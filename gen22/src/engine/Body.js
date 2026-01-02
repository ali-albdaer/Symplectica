import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

export class Body {
    constructor({
        id,
        name,
        type,
        mass,
        radius,
        color,
        luminosity = 0,
        emissiveIntensity = 0,
        initialPosition = new THREE.Vector3(),
        initialVelocity = new THREE.Vector3(),
        isPlayer = false,
        isInteractive = false,
        renderScale = 1
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.mass = mass;
        this.radius = radius;
        this.luminosity = luminosity;
        this.emissiveIntensity = emissiveIntensity;
        this.position = initialPosition.clone();
        this.velocity = initialVelocity.clone();
        this.acceleration = new THREE.Vector3();
        this.isPlayer = isPlayer;
        this.isInteractive = isInteractive;
        this.renderScale = renderScale;
        this.baseColor = color || 0xffffff;
        this.detailLevel = this.type === "star" ? 64 : 48;
        this.mesh = this.buildMesh(this.detailLevel);
        this.mesh.position.copy(this.position.clone().multiplyScalar(this.renderScale));
        this.light = null;
        if (this.luminosity > 0) {
            const intensity = Math.cbrt(this.luminosity) * 1e-9;
            this.light = new THREE.PointLight(color || 0xffffff, intensity, 0, 2);
            this.light.castShadow = false;
        }
        this.forceAccumulator = new THREE.Vector3();
        this.damping = 0.99998;
    }

    buildMesh(detail) {
        return this.createMesh(detail);
    }

    createMesh(detail) {
        const geometry = new THREE.SphereGeometry(1, detail, detail);
        const material = new THREE.MeshPhysicalMaterial({
            color: this.baseColor,
            emissive: new THREE.Color(this.baseColor),
            emissiveIntensity: this.emissiveIntensity,
            roughness: this.type === "star" ? 0.4 : 0.9,
            metalness: this.type === "star" ? 0.2 : 0.1,
            clearcoat: this.type === "planet" ? 0.1 : 0,
            clearcoatRoughness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.body = this;
        const scaledRadius = Math.max(this.radius * this.renderScale, 0.0001);
        mesh.scale.setScalar(scaledRadius);
        return mesh;
    }

    setDetail(detail) {
        if (detail === this.detailLevel) {
            return;
        }
        this.detailLevel = detail;
        const newMesh = this.createMesh(detail);
        const renderPosition = this.position.clone().multiplyScalar(this.renderScale);
        newMesh.position.copy(renderPosition);
        if (this.light) {
            this.light.position.copy(renderPosition);
        }
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.geometry = newMesh.geometry;
        this.mesh.material = newMesh.material;
        this.mesh.scale.copy(newMesh.scale);
    }

    applyForce(force) {
        this.forceAccumulator.add(force);
    }

    resetForce() {
        this.forceAccumulator.set(0, 0, 0);
    }

    integrate(dt) {
        if (!Number.isFinite(this.mass) || this.mass <= 0) {
            return;
        }
        const acceleration = this.forceAccumulator.clone().multiplyScalar(1 / this.mass);
        this.acceleration.copy(acceleration);
        this.velocity.add(acceleration.multiplyScalar(dt));
        this.velocity.multiplyScalar(this.damping);
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        const renderPosition = this.position.clone().multiplyScalar(this.renderScale);
        this.mesh.position.copy(renderPosition);
        if (this.light) {
            this.light.position.copy(renderPosition);
        }
        this.resetForce();
    }

    setPosition(position) {
        this.position.copy(position);
        const renderPosition = position.clone().multiplyScalar(this.renderScale);
        this.mesh.position.copy(renderPosition);
        if (this.light) {
            this.light.position.copy(renderPosition);
        }
    }

    setVelocity(velocity) {
        this.velocity.copy(velocity);
    }

    updateRadius(newRadius) {
        if (this.radius === newRadius) {
            return;
        }
        this.radius = newRadius;
        const scaledRadius = Math.max(this.radius * this.renderScale, 0.0001);
        this.mesh.scale.setScalar(scaledRadius);
    }
}
