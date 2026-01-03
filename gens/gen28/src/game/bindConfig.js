export function bindConfigToWorld({ config, nbodyWorld, celestial, debugLog }) {
	let lastLodEnabled = config.render.lod.enabled;

	return function apply() {
		// Physics globals
		nbodyWorld.G = config.sim.G;
		nbodyWorld.softening = config.sim.softening;

		// LOD toggle
		const lodEnabled = !!config.render.lod.enabled;
		if (lodEnabled !== lastLodEnabled) {
			for (const c of celestial) {
				const obj = c.mesh;
				if (obj && obj.isLOD && obj.levels?.length >= 3) {
					if (!lodEnabled) {
						obj.levels[0].distance = 0;
						obj.levels[1].distance = 1e9;
						obj.levels[2].distance = 1e9;
					} else {
						obj.levels[0].distance = 0;
						obj.levels[1].distance = 60;
						obj.levels[2].distance = 140;
					}
				}
			}
			debugLog?.push('info', `LOD ${lodEnabled ? 'enabled' : 'disabled'}`);
			lastLodEnabled = lodEnabled;
		}

		// Per-body values
		for (const c of celestial) {
			const cfg = config.bodies[c.id];
			if (!cfg) continue;

			c.body.mass = cfg.mass;

			// Radius: scale mesh from baseRadius.
			const baseR = c.mesh?.userData?.baseRadius;
			if (baseR && baseR > 0) {
				const s = cfg.radius / baseR;
				c.mesh.scale.setScalar(s);
				c.body.radius = cfg.radius;
			}

			// Sun luminosity via emissive intensity (visual only)
			if (c.isSun) {
				const intensity = 0.65 + 0.65 * (cfg.luminosity ?? 1.0);
				const setEmissive = (m) => {
					if (!m?.material) return;
					m.material.emissiveIntensity = intensity;
				};
				if (c.mesh?.isLOD) {
					for (const lvl of c.mesh.levels) setEmissive(lvl.object);
				} else {
					setEmissive(c.mesh);
				}
			}
		}
	};
}
