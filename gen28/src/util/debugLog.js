export class DebugLog {
	constructor(rootEl) {
		this.rootEl = rootEl;
		this.maxRows = 250;
		this.rows = [];
	}

	setVisible(visible) {
		this.rootEl.classList.toggle('hidden', !visible);
	}

	clear() {
		this.rows = [];
		this.rootEl.textContent = '';
	}

	push(level, message, extra) {
		const time = new Date();
		const stamp = time.toLocaleTimeString();
		const row = { stamp, level, message: String(message), extra };
		this.rows.push(row);
		if (this.rows.length > this.maxRows) this.rows.shift();

		const div = document.createElement('div');
		div.className = `row ${level}`;
		div.innerHTML = `<strong>[${stamp}]</strong> ${escapeHtml(row.message)}`;
		if (extra != null) {
			const pre = document.createElement('pre');
			pre.style.margin = '6px 0 0 0';
			pre.textContent = typeof extra === 'string' ? extra : JSON.stringify(extra, null, 2);
			div.appendChild(pre);
		}

		this.rootEl.appendChild(div);
		while (this.rootEl.childNodes.length > this.maxRows) {
			this.rootEl.removeChild(this.rootEl.firstChild);
		}
		this.rootEl.scrollTop = this.rootEl.scrollHeight;
	}
}

function escapeHtml(s) {
	return String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function installGlobalErrorHandlers(debugLog) {
	window.addEventListener('error', (ev) => {
		debugLog.push('error', ev.message || 'Unhandled error', {
			filename: ev.filename,
			lineno: ev.lineno,
			colno: ev.colno
		});
	});

	window.addEventListener('unhandledrejection', (ev) => {
		debugLog.push('error', 'Unhandled Promise rejection', {
			reason: stringifyReason(ev.reason)
		});
	});

	const origLog = console.log.bind(console);
	const origWarn = console.warn.bind(console);
	const origErr = console.error.bind(console);

	console.log = (...args) => {
		origLog(...args);
		debugLog.push('info', args.map(toStr).join(' '));
	};
	console.warn = (...args) => {
		origWarn(...args);
		debugLog.push('warn', args.map(toStr).join(' '));
	};
	console.error = (...args) => {
		origErr(...args);
		debugLog.push('error', args.map(toStr).join(' '));
	};
}

function toStr(v) {
	if (typeof v === 'string') return v;
	try { return JSON.stringify(v); } catch { return String(v); }
}

function stringifyReason(reason) {
	if (reason instanceof Error) {
		return {
			name: reason.name,
			message: reason.message,
			stack: reason.stack
		};
	}
	return reason;
}
