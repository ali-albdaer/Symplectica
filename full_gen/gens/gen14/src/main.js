import { installDebugOverlays } from "./core/Debug.js";

(async function boot() {
	installDebugOverlays();

	// If opened directly from disk, most browsers will block module/CORS requests to CDNs.
	// Do a lightweight check BEFORE importing Three/Cannon so we can show a useful error.
	if (location.protocol === "file:") {
		console.error(
			"This project must be served over HTTP (not file://).\n" +
			"Run a local server (e.g. `python -m http.server 8080`) and open http://localhost:8080/",
		);
		return;
	}

	const canvas = document.getElementById("app");
	try {
		const { Engine } = await import("./core/Engine.js");
		const engine = new Engine({ canvas });
		await engine.init();
		engine.start();
	} catch (err) {
		console.error("Fatal init error:", err);
		// Engine may not exist if imports failed; Debug overlay will still show console.error.
	}
})();
