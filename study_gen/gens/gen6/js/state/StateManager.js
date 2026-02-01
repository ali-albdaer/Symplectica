import { EventEmitter } from '../core/EventEmitter.js';
import { Vec3 } from '../utils/MathUtils.js';

let nextBodyId = 1;

export class Body {
    constructor(data = {}) {
        this.id = data.id || nextBodyId++;
        this.name = data.name || `Body ${this.id}`;
        this.type = data.type || "PLANET"; // STAR, PLANET, MOON, BLACK_HOLE, NEUTRON_STAR
        
        // Physical State (SI Units)
        this.mass = data.mass || 1.0;
        this.radius = data.radius || 1.0;
        
        this.pos = new Vec3(data.pos?.x || 0, data.pos?.y || 0, data.pos?.z || 0);
        this.vel = new Vec3(data.vel?.x || 0, data.vel?.y || 0, data.vel?.z || 0);
        this.acc = new Vec3(0, 0, 0); // Current frame acceleration

        // Visuals / Metadata
        this.color = data.color || 0xffffff;
        this.texture = data.texture || null;
        this.pulsarFreq = data.pulsarFreq || 0; // Hz
    }
}

export class StateManager extends EventEmitter {
    constructor() {
        super();
        this.bodies = [];
        this.time = 0;
    }

    addBody(data) {
        const body = new Body(data);
        this.bodies.push(body);
        this.emit('body-added', body);
        return body;
    }

    removeBody(id) {
        const index = this.bodies.findIndex(b => b.id === id);
        if (index !== -1) {
            const body = this.bodies[index];
            this.bodies.splice(index, 1);
            this.emit('body-removed', body.id);
        }
    }

    clear() {
        // Copy ids to avoid issues during iteration if listeners modify
        const ids = this.bodies.map(b => b.id);
        ids.forEach(id => this.emit('body-removed', id));
        this.bodies = [];
        this.time = 0;
        this.emit('clear');
    }

    serialize() {
        return JSON.stringify({
            time: this.time,
            bodies: this.bodies
        });
    }

    load(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.clear();
            this.time = data.time || 0;
            if (Array.isArray(data.bodies)) {
                data.bodies.forEach(bData => {
                    // Reconstruct Vec3s
                    this.addBody(bData);
                });
            }
            console.log("State loaded.");
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
}