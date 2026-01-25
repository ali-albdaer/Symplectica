export function applyFidelity({ config, renderer, sunLight, debugLog }) {
	const f = config.render.fidelity;
	const mapSize = config.render.shadowMapSize[f] ?? 2048;
	const dist = config.render.shadowDistance[f] ?? 120;

	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.render.pixelRatioCap));
	renderer.shadowMap.enabled = !!config.render.shadows;

	if (sunLight) {
		sunLight.castShadow = !!config.render.shadows;
		sunLight.shadow.mapSize.set(mapSize, mapSize);
		sunLight.shadow.camera.left = -dist;
		sunLight.shadow.camera.right = dist;
		sunLight.shadow.camera.top = dist;
		sunLight.shadow.camera.bottom = -dist;
		sunLight.shadow.camera.near = 0.5;
		sunLight.shadow.camera.far = dist * 4;
		sunLight.shadow.bias = -0.00015;
		sunLight.shadow.normalBias = 0.02;
		if (sunLight.shadow.map) sunLight.shadow.map.dispose();
	}

	debugLog?.push('info', `Fidelity applied: ${f} (shadows=${config.render.shadows})`);
}
