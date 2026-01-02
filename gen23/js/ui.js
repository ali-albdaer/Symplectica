class UIManager {
    constructor(player, physicsEngine) {
        this.player = player;
        this.physicsEngine = physicsEngine;
        this.stats = new Stats();
        this.gui = new lil.GUI();
        
        this.initStats();
        this.initGUI();
        this.initOverlay();
        
        this.gui.hide(); // Hidden by default, toggle with /
        
        document.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                this.gui._hidden ? this.gui.show() : this.gui.hide();
            }
        });
    }

    initStats() {
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);
        this.stats.dom.style.display = 'none'; // Toggleable
    }

    initGUI() {
        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(window.Config.physics, 'G', 0.1, 10);
        physicsFolder.add(window.Config.physics, 'dt', 0.001, 0.1);
        physicsFolder.add(window.Config.physics, 'substeps', 1, 10, 1);
        
        const graphicsFolder = this.gui.addFolder('Graphics');
        graphicsFolder.add(window.Config.graphics, 'fidelity', ['low', 'medium', 'high']).onChange(val => {
            // Trigger reload or update settings
            alert("Reload required for some settings to take effect.");
        });
        
        const debugFolder = this.gui.addFolder('Debug');
        debugFolder.add(window.Config.debug, 'showPhysics');
        debugFolder.add(window.Config.debug, 'showOrbits');
        
        const playerFolder = this.gui.addFolder('Player');
        playerFolder.add(this.player, 'moveSpeed', 1, 100);
        playerFolder.add(this.player, 'flySpeed', 10, 500);
        playerFolder.add(this.player, 'jumpForce', 5, 50);
    }

    initOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'debug-overlay';
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '10px';
        this.overlay.style.left = '10px';
        this.overlay.style.color = 'white';
        this.overlay.style.fontFamily = 'monospace';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.whiteSpace = 'pre';
        document.body.appendChild(this.overlay);
    }

    update() {
        this.stats.update();
        
        const pPos = this.player.position;
        const pVel = this.player.velocity;
        
        this.overlay.innerText = `
FPS: ${Math.round(this.stats.FPS || 0)}
Pos: ${pPos.x.toFixed(1)}, ${pPos.y.toFixed(1)}, ${pPos.z.toFixed(1)}
Vel: ${pVel.length().toFixed(1)}
Mode: ${this.player.isFlying ? 'FLY' : 'WALK'}
Cam: ${this.player.isThirdPerson ? '3RD' : '1ST'}
Grounded: ${this.player.isGrounded}
        `.trim();
    }
}

window.UIManager = UIManager;
