class CelestialBody {
    constructor(params, physicsEngine, scene) {
        this.name = params.name;
        this.mass = params.mass;
        this.radius = params.radius;
        this.isStatic = params.isStatic || false;
        
        this.position = new THREE.Vector3(params.position.x, params.position.y, params.position.z);
        this.velocity = new THREE.Vector3(params.velocity?.x || 0, params.velocity?.y || 0, params.velocity?.z || 0);
        this.acceleration = new THREE.Vector3();
        
        this.mesh = this.createMesh(params);
        scene.add(this.mesh);
        
        physicsEngine.addBody(this);
    }

    createMesh(params) {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        let material;

        if (params.isStar) {
            material = new THREE.MeshBasicMaterial({ 
                color: params.color,
                toneMapped: false
            });
            
            // Add light
            const light = new THREE.PointLight(params.color, 2, 0, 0); // infinite range, decay 0 (physically correct-ish)
            // Actually decay 2 is physical, but for game scaling we might want linear or none.
            // Let's use decay 0 for "sun" behavior in Three.js legacy or just high intensity.
            // Three.js physical lights use decay 2.
            light.decay = 0; 
            light.intensity = 3;
            light.castShadow = true;
            light.shadow.mapSize.width = window.Config.graphics.shadowMapSize;
            light.shadow.mapSize.height = window.Config.graphics.shadowMapSize;
            light.shadow.camera.near = 1;
            light.shadow.camera.far = 5000;
            light.shadow.bias = -0.0001;
            
            // Add a mesh to hold the light
            const lightMesh = new THREE.Mesh(geometry, material);
            lightMesh.add(light);
            
            // Glow effect (simple sprite)
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/glow.png'), 
                color: params.color, 
                transparent: true, 
                blending: THREE.AdditiveBlending 
            });
            const sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set(this.radius * 6, this.radius * 6, 1.0);
            lightMesh.add(sprite);

            return lightMesh;
        } else {
            material = new THREE.MeshStandardMaterial({
                color: params.color,
                roughness: 0.8,
                metalness: 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }
    }
}

class Prop {
    constructor(params, physicsEngine, scene) {
        this.mass = params.mass || 1;
        this.radius = params.radius || 1;
        this.position = params.position.clone();
        this.velocity = params.velocity ? params.velocity.clone() : new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.isStatic = false;

        const geometry = new THREE.BoxGeometry(this.radius, this.radius, this.radius);
        const material = new THREE.MeshStandardMaterial({ 
            color: params.color || Math.random() * 0xffffff,
            emissive: params.emissive || 0x000000
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);
        physicsEngine.addBody(this);
        
        // Add point light if emissive
        if (params.emissive && params.emissive > 0) {
            const light = new THREE.PointLight(params.emissive, 1, 20);
            this.mesh.add(light);
        }
    }
}

window.CelestialBody = CelestialBody;
window.Prop = Prop;
