/**
 * TerrainGenerator.js
 * Procedural terrain generation for planet surfaces.
 * Creates detailed ground geometry when player is near a planet.
 */

import * as THREE from 'three';
import { RENDER_SCALE } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Terrain');

export class TerrainGenerator {
    constructor(scene) {
        this.scene = scene;
        this.activeTerrain = null;
        this.currentBody = null;
        this.chunks = new Map();
        
        // Terrain parameters
        this.chunkSize = 0.01; // km
        this.resolution = 32; // vertices per side
        this.renderDistance = 0.05; // km
        
        logger.info('Terrain generator initialized');
    }

    /**
     * Update terrain based on player position
     */
    update(playerPosition, nearestBody) {
        if (!nearestBody) return;
        
        // Check if player is close enough to surface for terrain
        const altitude = this.getAltitude(playerPosition, nearestBody);
        
        if (altitude < this.renderDistance) {
            if (this.currentBody !== nearestBody) {
                this.clearTerrain();
                this.currentBody = nearestBody;
            }
            this.generateTerrainAround(playerPosition, nearestBody);
        } else {
            this.clearTerrain();
            this.currentBody = null;
        }
    }

    getAltitude(position, body) {
        const dx = position.x - body.position.x;
        const dy = position.y - body.position.y;
        const dz = position.z - body.position.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz) - body.radius;
    }

    generateTerrainAround(playerPosition, body) {
        // Get local coordinates relative to body surface
        const localPos = this.worldToLocal(playerPosition, body);
        
        // Calculate which chunks should be loaded
        const chunkX = Math.floor(localPos.x / this.chunkSize);
        const chunkZ = Math.floor(localPos.z / this.chunkSize);
        
        const chunksToKeep = new Set();
        const loadRadius = 2;
        
        for (let dx = -loadRadius; dx <= loadRadius; dx++) {
            for (let dz = -loadRadius; dz <= loadRadius; dz++) {
                const key = `${chunkX + dx},${chunkZ + dz}`;
                chunksToKeep.add(key);
                
                if (!this.chunks.has(key)) {
                    this.createChunk(chunkX + dx, chunkZ + dz, body, localPos);
                }
            }
        }
        
        // Remove distant chunks
        for (const [key, chunk] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                this.scene.remove(chunk);
                chunk.geometry.dispose();
                chunk.material.dispose();
                this.chunks.delete(key);
            }
        }
    }

    createChunk(chunkX, chunkZ, body, playerLocalPos) {
        const key = `${chunkX},${chunkZ}`;
        
        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(
            this.chunkSize * RENDER_SCALE.distance,
            this.chunkSize * RENDER_SCALE.distance,
            this.resolution,
            this.resolution
        );
        
        // Apply height noise
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i); // PlaneGeometry uses Y for what will become Z
            
            // Simple noise-based height
            const worldX = chunkX * this.chunkSize + x / RENDER_SCALE.distance;
            const worldZ = chunkZ * this.chunkSize + z / RENDER_SCALE.distance;
            
            const height = this.generateHeight(worldX, worldZ);
            positions.setZ(i, height * RENDER_SCALE.distance);
        }
        
        geometry.computeVertexNormals();
        
        // Create material based on body type
        const material = this.createTerrainMaterial(body);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Lay flat
        
        // Position chunk
        mesh.position.set(
            chunkX * this.chunkSize * RENDER_SCALE.distance,
            0,
            chunkZ * this.chunkSize * RENDER_SCALE.distance
        );
        
        // Transform to planet surface
        this.transformToSurface(mesh, body, playerLocalPos);
        
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.chunks.set(key, mesh);
    }

    generateHeight(x, z) {
        // Multi-octave noise for terrain
        let height = 0;
        let amplitude = 0.0001; // km
        let frequency = 100;
        
        for (let i = 0; i < 4; i++) {
            height += Math.sin(x * frequency) * Math.cos(z * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return height;
    }

    createTerrainMaterial(body) {
        const baseColor = new THREE.Color(body.color || 0x888888);
        
        // Darken for ground
        baseColor.multiplyScalar(0.6);
        
        return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false,
        });
    }

    worldToLocal(position, body) {
        // Convert world position to local surface coordinates
        const dx = position.x - body.position.x;
        const dy = position.y - body.position.y;
        const dz = position.z - body.position.z;
        
        // For now, simple projection (should use proper spherical coords)
        return { x: dx, y: dy, z: dz };
    }

    transformToSurface(mesh, body, playerLocalPos) {
        // Get surface position
        const scaledBodyPos = {
            x: body.position.x * RENDER_SCALE.distance,
            y: body.position.y * RENDER_SCALE.distance,
            z: body.position.z * RENDER_SCALE.distance,
        };
        
        const scaledRadius = body.radius * RENDER_SCALE.distance;
        
        // Calculate up vector at player position
        const upVector = new THREE.Vector3(
            playerLocalPos.x,
            playerLocalPos.y,
            playerLocalPos.z
        ).normalize();
        
        // Position terrain on surface
        mesh.position.add(new THREE.Vector3(
            scaledBodyPos.x + upVector.x * scaledRadius,
            scaledBodyPos.y + upVector.y * scaledRadius,
            scaledBodyPos.z + upVector.z * scaledRadius
        ));
        
        // Orient terrain to face outward
        mesh.lookAt(new THREE.Vector3(
            scaledBodyPos.x + upVector.x * (scaledRadius + 1),
            scaledBodyPos.y + upVector.y * (scaledRadius + 1),
            scaledBodyPos.z + upVector.z * (scaledRadius + 1)
        ));
    }

    clearTerrain() {
        for (const [key, chunk] of this.chunks) {
            this.scene.remove(chunk);
            chunk.geometry.dispose();
            chunk.material.dispose();
        }
        this.chunks.clear();
    }

    dispose() {
        this.clearTerrain();
        logger.info('Terrain generator disposed');
    }
}
