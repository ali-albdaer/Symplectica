export class DevMenu {
  constructor({ GUI, configStore, world, system, player, input, debugOverlay }) {
    this.GUI = GUI;
    this.configStore = configStore;
    this.world = world;
    this.system = system;
    this.player = player;
    this.input = input;
    this.debugOverlay = debugOverlay;

    this.gui = new GUI({ title: 'Dev Menu' });
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.right = '12px';
    this.gui.domElement.style.top = '12px';
    this.gui.domElement.style.zIndex = '10';

    this.isOpen = false;
    this.gui.hide();

    this._build();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.gui.show();
    else this.gui.hide();
  }

  _build() {
    const c = this.configStore.data;

    const sim = this.gui.addFolder('Simulation');
    sim.add(c.sim, 'timeScale', 0, 400, 1).onChange((v) => this.configStore.patch('sim.timeScale', v));
    sim.add(c.sim, 'fixedDt', 1 / 600, 1 / 30, 1 / 600).onChange((v) => this.configStore.patch('sim.fixedDt', v));
    sim.add(c.sim, 'gravitySoftening', 0.0, 0.2, 0.001).onChange((v) => this.configStore.patch('sim.gravitySoftening', v));
    sim.add(c.sim, 'G', 0.01, 10, 0.01).onChange((v) => this.configStore.patch('sim.G', v));

    const gfx = this.gui.addFolder('Graphics');
    gfx.add(c.graphics, 'fidelity', ['Low', 'Medium', 'Ultra']).onChange((v) => this.configStore.patch('graphics.fidelity', v));
    gfx.add(c.graphics, 'enableShadows').onChange((v) => this.configStore.patch('graphics.enableShadows', v));
    gfx.add(c.graphics, 'enableLOD').onChange((v) => this.configStore.patch('graphics.enableLOD', v));
    gfx.add(c.graphics, 'pixelRatioCap', 0.75, 3.0, 0.05).onChange((v) => this.configStore.patch('graphics.pixelRatioCap', v));
    gfx.add(c.graphics, 'starCount', 500, 25000, 100).onChange((v) => this.configStore.patch('graphics.starCount', v));

    const debug = this.gui.addFolder('Debug');
    debug.add(c.debug, 'showTelemetry').onChange((v) => this.configStore.patch('debug.showTelemetry', v));
    debug.add(c.debug, 'showDebugLog').onChange((v) => this.configStore.patch('debug.showDebugLog', v));

    const bodies = this.gui.addFolder('Bodies');
    this._bodyFolder(bodies, 'sun');
    this._bodyFolder(bodies, 'planet1');
    this._bodyFolder(bodies, 'planet2');
    this._bodyFolder(bodies, 'moon1');

    const player = this.gui.addFolder('Player');
    player.add(c.player, 'mass', 0.0001, 0.02, 0.0001).onChange((v) => this.configStore.patch('player.mass', v));
    player.add(c.player.walk, 'speed', 0.1, 5.0, 0.05).onChange((v) => this.configStore.patch('player.walk.speed', v));
    player.add(c.player.walk, 'jumpSpeed', 0.1, 5.0, 0.05).onChange((v) => this.configStore.patch('player.walk.jumpSpeed', v));
    player.add(c.player.flight, 'accel', 0.1, 10.0, 0.1).onChange((v) => this.configStore.patch('player.flight.accel', v));
    player.add(c.player.flight, 'maxSpeed', 0.1, 25.0, 0.1).onChange((v) => this.configStore.patch('player.flight.maxSpeed', v));

    const tools = this.gui.addFolder('Tools');
    tools.add(
      {
        recenter: () => {
          try {
            const p = this.player.body.position;
            const target = this.system.planet1.position.clone().add(p.clone().sub(this.system.planet1.position).normalize().multiplyScalar(this.system.planet1.radius + 0.25));
            this.player.body.position.copy(target);
            this.player.body.velocity.set(0, 0, 0);
          } catch (e) {
            this.debugOverlay.log('Recenter failed', e);
          }
        },
      },
      'recenter'
    );
  }

  _bodyFolder(parent, key) {
    const body = this.configStore.data.bodies[key];
    const f = parent.addFolder(body.name);
    f.add(body, 'mass', 0.001, 5000, 0.001).onChange((v) => this.configStore.patch(`bodies.${key}.mass`, v));
    f.add(body, 'radius', 0.05, 30, 0.01).onChange((v) => this.configStore.patch(`bodies.${key}.radius`, v));
    if (body.daySeconds !== undefined) {
      f.add(body, 'daySeconds', 1, 120, 1).onChange((v) => this.configStore.patch(`bodies.${key}.daySeconds`, v));
    }
    if (body.orbitRadius !== undefined) {
      f.add(body, 'orbitRadius', 5, 250, 0.1).onChange((v) => this.configStore.patch(`bodies.${key}.orbitRadius`, v));
    }
    if (body.orbitRadiusAroundPlanet1 !== undefined) {
      f.add(body, 'orbitRadiusAroundPlanet1', 0.5, 25, 0.05).onChange((v) => this.configStore.patch(`bodies.${key}.orbitRadiusAroundPlanet1`, v));
    }
  }
}
