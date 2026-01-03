// Base entity: extend this to add new "Special Entities" without changing the engine loop.
export class Entity {
	constructor(name) {
		this.name = name ?? this.constructor.name;
		this.enabled = true;
		this.tags = new Set();
	}

	// Called once after being added.
	init(_ctx) {}

	// Called before physics step (good place to apply forces).
	beforePhysics(_ctx) {}

	// Called after physics step (good place to sync visuals).
	afterPhysics(_ctx) {}

	// Called once per render frame.
	update(_ctx) {}

	dispose(_ctx) {}
}
