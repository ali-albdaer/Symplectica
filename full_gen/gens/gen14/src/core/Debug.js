import { Config } from "../Config.js";

const MAX_LOG_LINES = 250;

export function installDebugOverlays() {
	const debugEl = document.getElementById("debuglog");
	if (!debugEl) return;

	const original = {
		log: console.log.bind(console),
		warn: console.warn.bind(console),
		error: console.error.bind(console),
	};

	const state = {
		lines: [],
	};

	function pushLine(kind, parts) {
		if (!Config.ui.debugLogEnabled) return;
		const text = parts
			.map((p) => {
				if (p instanceof Error) return `${p.name}: ${p.message}\n${p.stack ?? ""}`;
				if (typeof p === "object") {
					try {
						return JSON.stringify(p);
					} catch {
						return String(p);
					}
				}
				return String(p);
			})
			.join(" ");

		state.lines.push({ kind, text, time: performance.now() });
		if (state.lines.length > MAX_LOG_LINES) state.lines.shift();
		render();
	}

	function render() {
		if (!Config.ui.debugLogEnabled) {
			debugEl.classList.add("hidden");
			return;
		}
		debugEl.classList.remove("hidden");
		debugEl.innerHTML = state.lines
			.map((l) => {
				const cls = l.kind === "error" ? "err" : l.kind === "warn" ? "muted" : "";
				return `<div class="${cls}">${escapeHtml(l.text)}</div>`;
			})
			.join("");
	}

	// Make it obvious that the overlay is active (but keep it unobtrusive).
	pushLine("warn", ["Debug log active. If you see a black screen, check for module/CORS or file:// issues."]);

	console.log = (...args) => {
		original.log(...args);
		pushLine("log", args);
	};
	console.warn = (...args) => {
		original.warn(...args);
		pushLine("warn", args);
	};
	console.error = (...args) => {
		original.error(...args);
		pushLine("error", args);
	};

	window.addEventListener("error", (e) => {
		pushLine("error", ["Window error:", e.error ?? e.message ?? e]);
	});
	window.addEventListener("unhandledrejection", (e) => {
		pushLine("error", ["Unhandled rejection:", e.reason]);
	});
}

export class DebugUI {
	constructor() {
		this.debugEl = document.getElementById("debuglog");
	}

	showFatal(err) {
		Config.ui.debugLogEnabled = true;
		this.debugEl?.classList.remove("hidden");
		console.error("FATAL:", err);
	}
}

function escapeHtml(text) {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
