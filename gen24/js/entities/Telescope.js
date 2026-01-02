import * as THREE from 'three';
import { Prop } from './Prop.js';

export class Telescope extends Prop {
    constructor(config, scene) {
        super(config, scene);
        // Telescope specific logic would go here
        // e.g. a secondary camera that renders to a texture
        this.name = "Telescope";
    }

    use() {
        console.log("Looking through telescope...");
        // Switch main camera to telescope camera
    }
}
