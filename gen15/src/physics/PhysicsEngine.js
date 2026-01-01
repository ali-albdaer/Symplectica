import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

export class PhysicsEngine {
  constructor({ config, logger, eventBus }) {
    this.config = config;
    this.logger = logger;
    this.eventBus = eventBus;
    this.world = null;
    this.celestialBodies = [];
    this.microObjects = [];
    this.gravitationalPairs = [];
  }

  init() {
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.solver.iterations = 15;
    this.world.solver.tolerance = 0.001;
    this.world.defaultContactMaterial.restitution = 0.2;
    this.world.defaultContactMaterial.friction = 0.4;
    this.world.gravity.set(0, 0, 0);
    this.setupBodies();
    this.logger?.log("Physics world initialized");
  }

  setupBodies() {
    this.celestialBodies = [];
    this.microObjects = [];
    this.config.celestialBodies.forEach((bodyDef) => {
      const body = this.createCelestialBody(bodyDef);
      this.world.addBody(body.body);
      this.celestialBodies.push(body);
    });

    this.config.microObjects.forEach((microDef) => {
      const micro = this.createMicroObject(microDef);
      this.world.addBody(micro.body);
      this.microObjects.push(micro);
    });
  }

  createCelestialBody(def) {
    const shape = new CANNON.Sphere(def.radius);
    const body = new CANNON.Body({
      mass: def.type === "star" ? 0 : def.mass,
      shape,
      position: new CANNON.Vec3(0, 0, 0),
    });
    body._gravityMass = def.mass;

    if (def.initialPosition) {
      body.position.set(def.initialPosition.x, def.initialPosition.y, def.initialPosition.z);
      if (def.initialVelocity) {
        body.velocity.set(def.initialVelocity.x, def.initialVelocity.y, def.initialVelocity.z);
      }
    } else if (def.parent) {
      const parent =
        this.celestialBodies.find((b) => b.id === def.parent) ||
        this.config.celestialBodies.find((b) => b.id === def.parent);
      const phase = def.initialPhase || 0;
      const offset = new CANNON.Vec3(
        Math.cos(phase) * def.orbitalRadius,
        0,
        Math.sin(phase) * def.orbitalRadius
      );
      const parentPos = parent?.body?.position || parent?.initialPosition || { x: 0, y: 0, z: 0 };
      body.position.set(parentPos.x + offset.x, parentPos.y + offset.y, parentPos.z + offset.z);
      body.velocity.set(-Math.sin(phase) * def.orbitalSpeed, 0, Math.cos(phase) * def.orbitalSpeed);
    } else {
      const phase = def.initialPhase || 0;
      const offset = new CANNON.Vec3(
        Math.cos(phase) * def.orbitalRadius,
        0,
        Math.sin(phase) * def.orbitalRadius
      );
      body.position.set(offset.x, offset.y, offset.z);
      body.velocity.set(-Math.sin(phase) * def.orbitalSpeed, 0, Math.cos(phase) * def.orbitalSpeed);
    }

    return {
      id: def.id,
      def,
      body,
    };
  }

  addSpecialBody(definition) {
    const entry = this.createCelestialBody(definition);
    this.world.addBody(entry.body);
    this.celestialBodies.push(entry);
    return entry;
  }

  createMicroObject(def) {
    const shape = new CANNON.Box(new CANNON.Vec3(def.size, def.size, def.size));
    const body = new CANNON.Body({
      mass: def.mass,
      shape,
      position: new CANNON.Vec3(def.position.x, def.position.y, def.position.z),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.1 }),
    });
    body._gravityMass = def.mass;
    return { def, body };
  }

  step(dt) {
    if (!this.world) return;
    this.applyGravitationalForces();
    this.world.step(this.config.physicsTimeStep, dt, 5);
  }

  applyGravitationalForces() {
    const G = this.config.gravityConstant;
    const bodies = [...this.celestialBodies, ...this.microObjects];
    bodies.forEach((entry) => entry.body.force.set(0, 0, 0));
    for (let i = 0; i < bodies.length - 1; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i].body;
        const bodyB = bodies[j].body;
        const massA = bodyA._gravityMass ?? bodyA.mass;
        const massB = bodyB._gravityMass ?? bodyB.mass;
        if (!massA || !massB) continue;
        const delta = bodyB.position.vsub(bodyA.position);
        const distanceSq = Math.max(delta.lengthSquared(), 1e-4);
        const forceMagnitude = (G * massA * massB) / distanceSq;
        const direction = delta.unit();
        const force = direction.scale(forceMagnitude);
        bodyA.applyForce(new CANNON.Vec3(-force.x, -force.y, -force.z));
        bodyB.applyForce(force);
      }
    }
  }

  registerPlayerBody(body) {
    if (!this.world) return;
    this.world.addBody(body);
  }
}
