import * as THREE from 'three';
import { RenderEngine } from './RenderEngine.js';

export class Visuals {
    constructor(scene) {
        this.scene = scene;
        this.meshes = new Map(); // bodyId -> THREE.Mesh
        
        // Geometries shared
        this.sphereGeo = new THREE.SphereGeometry(1, 32, 32);
        
        // Materials shared
        this.materials = {
            STAR: new THREE.MeshBasicMaterial({ color: 0xffdddd }),
            PLANET: new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: 0.8 }),
            MOON: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 }),
            BLACK_HOLE: new THREE.MeshBasicMaterial({ color: 0x000000 }), // Special shader later?
            NEUTRON_STAR: new THREE.MeshBasicMaterial({ color: 0x00ffff }) 
        };
        
        // Lighting
        const ambient = new THREE.AmbientLight(0x333333);
        this.scene.add(ambient);
        
        const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
        sunLight.position.set(0, 0, 0); // Sun is usually at 0,0,0 local
        this.scene.add(sunLight);
        this.sunLight = sunLight;
    }

    update(bodies, cameraPhysPos) {
        // Remove bodies that no longer exist
        const bodyIds = new Set(bodies.map(b => b.id));
        for (const [id, mesh] of this.meshes) {
            if (!bodyIds.has(id)) {
                this.scene.remove(mesh);
                this.meshes.delete(id);
            }
        }

        // Update / Create bodies
        for (const body of bodies) {
            let mesh = this.meshes.get(body.id);
            if (!mesh) {
                mesh = this.createBodyMesh(body);
                this.scene.add(mesh);
                this.meshes.set(body.id, mesh);
            }

            // FLOATING ORIGIN: Render Pos = Physics Pos - Camera Physics Pos
            // We scale down the relative distance for rendering if needed, 
            // but for now let's try 1:1 scale but centered on camera.
            // If the solar system is 1e11 meters, 32-bit float has precision of ~10^4 at that range.
            // Centering on camera ensures nearby objects are high precision.
            
            // However, 1 unit = 1 meter is too big for Three.js Z-buffer defaults usually.
            // Let's use a scale factor: 1 Render Unit = 1000 km = 1e6 meters.
            const RENDER_SCALE = 1e-6; 

            const rx = (body.pos.x - cameraPhysPos.x) * RENDER_SCALE;
            const ry = (body.pos.y - cameraPhysPos.y) * RENDER_SCALE;
            const rz = (body.pos.z - cameraPhysPos.z) * RENDER_SCALE;

            mesh.position.set(rx, ry, rz);

            // Scale radius
            const rRadius = body.radius * RENDER_SCALE;
            mesh.scale.set(rRadius, rRadius, rRadius);
            
            // If it's a star, move the light source to it
            if (body.type === 'STAR') {
                this.sunLight.position.set(rx, ry, rz);
            }
        }
    }

    createBodyMesh(body) {
        let material = this.materials[body.type] || this.materials.PLANET;
        
        // Instance-specific color override
        if (body.color) {
            material = material.clone();
            material.color.setHex(body.color);
        }

        const mesh = new THREE.Mesh(this.sphereGeo, material);
        
        // Add specific FX based on type
        if (body.type === 'BLACK_HOLE') {
            // Add accretion disk or lensing ring
            const ringGeo = new THREE.RingGeometry(1.2, 3, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, transparent:true, opacity:0.5 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);
        }

        return mesh;
    }
}