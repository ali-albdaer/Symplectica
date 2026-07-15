#!/usr/bin/env node
// scripts/bench.js
// Deterministic performance benchmark runner for Symplectica.
//
// PREREQUISITES:
//   - npm run dev must already be running (server + client)
//   - npx playwright install chromium  (one-time)
//
// USAGE:
//   node scripts/bench.js                         # uses scripts/bench-path.json
//   node scripts/bench.js path/to/custom.json     # custom path file
//
// OUTPUT:  local/perf/bench_<ISO-timestamp>.json
'use strict';

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const BENCH_URL           = process.env.BENCH_URL  || 'http://localhost:3000/';
const BENCH_PATH_ARG      = process.argv[2]        || 'solar-system';
const BENCH_PATH_FILE     = path.extname(BENCH_PATH_ARG) 
    ? path.resolve(BENCH_PATH_ARG) 
    : path.resolve(__dirname, '..', 'benchmarks', `${BENCH_PATH_ARG}.json`);
const APP_READY_TIMEOUT   = 30_000; // ms to wait for __metrics to appear

// ─── Statistics helpers ────────────────────────────────────────────────────
function pct(sorted, p) {
    if (!sorted.length) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function stats(values) {
    const v = values.filter(x => x != null && !isNaN(x));
    if (!v.length) return { avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    const sorted = [...v].sort((a, b) => a - b);
    const sum    = sorted.reduce((a, b) => a + b, 0);
    const fmt    = n => parseFloat(n.toFixed(3));
    return {
        avg: fmt(sum / sorted.length),
        min: fmt(sorted[0]),
        max: fmt(sorted[sorted.length - 1]),
        p95: fmt(pct(sorted, 95)),
        p99: fmt(pct(sorted, 99)),
    };
}

// ─── Step executor ─────────────────────────────────────────────────────────
async function executeStep(page, step) {
    const note = step.note ? `  [${step.note}]` : '';
    console.log(`  → ${step.type}${step.label ? ` "${step.label}"` : ''}${step.presetId ? ` "${step.presetId}"` : ''}${step.value ? ` "${step.value}"` : ''}${note}`);

    const wait = ms => page.waitForTimeout(ms);

    switch (step.type) {

        // ── Timing ──────────────────────────────────────────────────────
        case 'wait':
            await wait(step.waitMs ?? 1000);
            break;

        case 'sample':
            // Sets the chapter label; background poller buckets subsequent
            // samples under this label automatically — no extra data collected here.
            await page.evaluate(label => { window.__benchCurrentLabel = label; }, step.label);
            if (step.waitMs) await wait(step.waitMs);
            break;

        // ── Navigation ──────────────────────────────────────────────────
        case 'nextBody':
            await page.keyboard.press('n');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'prevBody':
            await page.keyboard.press('p');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'zoomIn': {
            const n = step.count ?? 1;
            for (let i = 0; i < n; i++) {
                await page.keyboard.down('Space');
                await wait(400);
                await page.keyboard.up('Space');
                await wait(80);
            }
            if (step.waitMs) await wait(step.waitMs);
            break;
        }

        case 'zoomOut': {
            const n = step.count ?? 1;
            for (let i = 0; i < n; i++) {
                await page.keyboard.down('ShiftLeft');
                await wait(400);
                await page.keyboard.up('ShiftLeft');
                await wait(80);
            }
            if (step.waitMs) await wait(step.waitMs);
            break;
        }

        case 'orbitLeft':
            await page.keyboard.down('a');
            await wait(step.durationMs ?? 1000);
            await page.keyboard.up('a');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'orbitRight':
            await page.keyboard.down('d');
            await wait(step.durationMs ?? 1000);
            await page.keyboard.up('d');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'orbitUp':
            await page.keyboard.down('w');
            await wait(step.durationMs ?? 1000);
            await page.keyboard.up('w');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'orbitDown':
            await page.keyboard.down('s');
            await wait(step.durationMs ?? 1000);
            await page.keyboard.up('s');
            if (step.waitMs) await wait(step.waitMs);
            break;

        // ── Simulation presets ───────────────────────────────────────────
        case 'loadPreset':
            // Load preset via admin panel UI interaction
            await page.evaluate(id => {
                const presetSelect = document.querySelector('#admin-preset');
                if (presetSelect) {
                    presetSelect.value = id;
                    presetSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                document.querySelector('#admin-load-preset')?.click();
            }, step.presetId);
            if (step.waitMs) await wait(step.waitMs);
            break;

        // ── Visual quality ───────────────────────────────────────────────
        case 'setVisualPreset':
            // #opt-preset: values are 'Low', 'High', 'Ultra'
            await page.evaluate(val => {
                const el = document.querySelector('#opt-preset');
                if (el) { el.value = val; el.dispatchEvent(new Event('change', { bubbles: true })); }
            }, step.value);
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'setRingQuality':
            // values: 'Performance', 'HighQualityClose', 'HighQualityAlways'
            await page.evaluate(val => {
                const el = document.querySelector('#opt-ring-quality');
                if (el) { el.value = val; el.dispatchEvent(new Event('change', { bubbles: true })); }
            }, step.value);
            if (step.waitMs) await wait(step.waitMs);
            break;

        // ── Rendering toggles (click checkbox even if panel is hidden) ───
        case 'toggleAtmospheres':
            await page.evaluate(() => document.querySelector('#opt-atmospheres')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'toggleOrbits':
            await page.evaluate(() => document.querySelector('#opt-orbits')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'toggleRealisticTextures':
            await page.evaluate(() => document.querySelector('#opt-realistic-textures')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'toggleStarLabels':
            await page.evaluate(() => document.querySelector('#opt-star-labels')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'togglePlanetLabels':
            await page.evaluate(() => document.querySelector('#opt-planet-labels')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'toggleMoonLabels':
            await page.evaluate(() => document.querySelector('#opt-moon-labels')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'toggleFlares':
            await page.evaluate(() => document.querySelector('#opt-flares-visible')?.click());
            if (step.waitMs) await wait(step.waitMs);
            break;

        // ── UI overlays ──────────────────────────────────────────────────
        case 'toggleUI':
            await page.keyboard.press('h');
            if (step.waitMs) await wait(step.waitMs);
            break;

        case 'togglePerfMonitor':
            await page.keyboard.press('3');
            if (step.waitMs) await wait(step.waitMs);
            break;

        default:
            console.warn(`  [WARN] Unknown step type: "${step.type}" — skipped`);
    }
}

// ─── Report builder ─────────────────────────────────────────────────────────
function buildReport(config, pollBuffer, spikeThresholdMs) {
    // Determine labels in order of first appearance
    const labels = [];
    const seen = new Set();
    for (const s of pollBuffer) {
        if (s.label !== 'unlabeled' && !seen.has(s.label)) {
            labels.push(s.label);
            seen.add(s.label);
        }
    }

    // Auto-compute spike threshold from session median if not specified
    const allFrameMs = pollBuffer.map(s => s.frameMs).filter(v => v > 0);
    const sortedAll  = [...allFrameMs].sort((a, b) => a - b);
    const median     = sortedAll[Math.floor(sortedAll.length / 2)] || 1;
    const threshold  = spikeThresholdMs || parseFloat((median * 2).toFixed(2));

    // Per-label aggregation
    const byLabel = {};
    for (const label of labels) {
        const s = pollBuffer.filter(p => p.label === label);
        const last = s[s.length - 1] ?? {};
        byLabel[label] = {
            frameMs:    stats(s.map(p => p.frameMs)),
            renderMs:   stats(s.map(p => p.renderMs)),
            physicsMs:  stats(s.map(p => p.physicsMs)),
            uiMs:       stats(s.map(p => p.uiMs)),
            fps:        stats(s.map(p => p.fps)),
            drawCalls:  last.drawCalls ?? 0,
            triangles:  last.triangles ?? 0,
            heapMB:     stats(s.filter(p => p.heapMB).map(p => p.heapMB)),
            sampleCount: s.length,
        };
    }

    // Overall summary across all labeled sections
    const relevant = pollBuffer.filter(s => s.label !== 'unlabeled');
    const last      = relevant[relevant.length - 1] ?? {};
    const summary = relevant.length > 0 ? {
        frameMs:     stats(relevant.map(s => s.frameMs)),
        renderMs:    stats(relevant.map(s => s.renderMs)),
        physicsMs:   stats(relevant.map(s => s.physicsMs)),
        uiMs:        stats(relevant.map(s => s.uiMs)),
        fps:         stats(relevant.map(s => s.fps)),
        heapMB:      stats(relevant.filter(s => s.heapMB).map(s => s.heapMB)),
        drawCalls:   last.drawCalls ?? 0,
        triangles:   last.triangles ?? 0,
        totalSamples: relevant.length,
    } : { totalSamples: 0 };

    // Spike log — timestamps relative to first sample in buffer
    const t0 = pollBuffer[0]?.timestamp ?? 0;
    const spikes = pollBuffer
        .filter(s => s.frameMs > threshold)
        .map(s => ({
            label:     s.label,
            elapsedMs: Math.round(s.timestamp - t0),
            frameMs:   parseFloat(s.frameMs.toFixed(2)),
            heapMB:    s.heapMB ? parseFloat(s.heapMB.toFixed(1)) : null,
        }));

    return {
        meta: {
            date:              new Date().toISOString(),
            pathFile:          path.basename(BENCH_PATH_FILE),
            description:       config.meta?.description ?? '',
            spikeThresholdMs:  threshold,
            totalPollSamples:  pollBuffer.length,
        },
        summary,
        byLabel,
        spikes,
    };
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
    console.log('[bench] Symplectica Benchmark Runner');
    console.log(`   Path file : ${BENCH_PATH_FILE}`);
    console.log(`   Target URL: ${BENCH_URL}`);
    console.log('');

    if (!fs.existsSync(BENCH_PATH_FILE)) {
        console.error(`[ERROR] bench path file not found: ${BENCH_PATH_FILE}`);
        process.exit(1);
    }

    const config          = JSON.parse(fs.readFileSync(BENCH_PATH_FILE, 'utf8'));
    const spikeThreshold  = config.meta?.spikeThresholdMs ?? null;
    const outputDir       = path.resolve(__dirname, '..', config.meta?.outputDir ?? 'local/perf');

    // ── Launch browser ───────────────────────────────────────────────────
    // headless:false required — headless Chrome uses software rendering
    // which would produce invalid GPU timing measurements.
    console.log('[bench] Launching Chrome (headless:false for real GPU rendering)...');
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized', '--disable-infobars'],
    });

    const context = await browser.newContext({ viewport: null });
    const page    = await context.newPage();

    try {
        // ── Navigate & wait for app ──────────────────────────────────────
        console.log(`   Navigating to ${BENCH_URL}...`);
        await page.goto(BENCH_URL, { waitUntil: 'domcontentloaded' });

        console.log(`   Waiting up to ${APP_READY_TIMEOUT / 1000}s for window.__metrics...`);
        await page.waitForFunction(() => typeof window.__metrics !== 'undefined', {
            timeout: APP_READY_TIMEOUT,
        });
        // Extra settle time so EMA averages are seeded
        await page.waitForTimeout(1500);
        console.log('   [bench] App ready and metrics shim confirmed.');

        // ── Click canvas to give keyboard focus to the app ───────────────
        // Click near centre of viewport, away from UI panels.
        const vp = page.viewportSize() ?? { width: 1280, height: 720 };
        await page.mouse.click(vp.width / 2, vp.height / 2);
        await page.waitForTimeout(300);

        // ── Send /name Benchmark via chat ────────────────────────────────
        // Done via evaluate() to avoid any focus/visibility complications.
        await page.evaluate(() => {
            const panel = document.querySelector('#chat-panel');
            if (panel) panel.classList.remove('minimized');
            const input = document.querySelector('#chat-input');
            if (!input) return;
            input.focus();
            input.value = '/name Benchmark';
            input.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true,
            }));
        });
        await page.waitForTimeout(400);

        // Return focus to canvas so keyboard step types work
        await page.mouse.click(vp.width / 2, vp.height / 2);
        await page.waitForTimeout(300);

        // ── Start background poller ──────────────────────────────────────
        // Runs inside the browser process; polls every 100ms via setInterval.
        // Uses the EMA-averaged values already computed by the app each frame.
        // No additional per-frame work is performed in the app itself.
        console.log('   Starting metrics poller (100ms interval)...');
        await page.evaluate(() => {
            window.__benchCurrentLabel = 'unlabeled';
            window.__benchPollBuffer   = [];
            window.__benchPollInterval = setInterval(() => {
                try {
                    const snap = window.__metrics.getSnapshot();
                    window.__benchPollBuffer.push({ ...snap, label: window.__benchCurrentLabel });
                } catch (_) { /* ignore if metrics temporarily unavailable */ }
            }, 100);
        });

        // ── Execute path steps ───────────────────────────────────────────
        console.log(`\n[bench] Running ${config.steps.length} path steps...\n`);
        for (const step of config.steps) {
            await executeStep(page, step);
        }

        // ── Collect & stop poller ────────────────────────────────────────
        console.log('\n[bench] Collecting poll buffer...');
        const pollBuffer = await page.evaluate(() => {
            clearInterval(window.__benchPollInterval);
            return window.__benchPollBuffer;
        });
        console.log(`   ${pollBuffer.length} samples collected.`);

        // ── Build report ─────────────────────────────────────────────────
        const report = buildReport(config, pollBuffer, spikeThreshold);

        // ── Write JSON output ─────────────────────────────────────────────
        fs.mkdirSync(outputDir, { recursive: true });
        const ts      = new Date().toISOString().replace(/:/g, '-').slice(0, 19) + 'Z';
        const outFile = path.join(outputDir, `bench_${ts}.json`);
        fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

        // ── Console summary ───────────────────────────────────────────────
        const bar = '─'.repeat(62);
        console.log('\n' + bar);
        console.log('[bench] BENCHMARK COMPLETE');
        console.log(bar);
        console.log(`  Report  : ${outFile}`);
        console.log(`  Samples : ${report.meta.totalPollSamples} total  |  ${report.summary.totalSamples ?? 0} labeled`);
        if (report.summary.frameMs) {
            console.log(`  Frame   : avg=${report.summary.frameMs.avg}ms  p95=${report.summary.frameMs.p95}ms  max=${report.summary.frameMs.max}ms`);
            console.log(`  Render  : avg=${report.summary.renderMs.avg}ms  p95=${report.summary.renderMs.p95}ms`);
            console.log(`  Heap    : avg=${report.summary.heapMB.avg}MB  max=${report.summary.heapMB.max}MB`);
            console.log(`  GPU     : ${report.summary.drawCalls} draw calls  |  ${report.summary.triangles.toLocaleString()} triangles`);
        }
        console.log(`  Spikes  : ${report.spikes.length} (threshold: >${report.meta.spikeThresholdMs}ms)`);
        if (report.spikes.length > 0 && report.spikes.length <= 20) {
            for (const s of report.spikes) {
                console.log(`     t=${(s.elapsedMs / 1000).toFixed(1)}s  [${s.label}]  ${s.frameMs}ms  heap=${s.heapMB}MB`);
            }
        } else if (report.spikes.length > 20) {
            console.log(`     (${report.spikes.length} spikes — see JSON for full list)`);
        }
        console.log(bar + '\n');

    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('\n[ERROR] Benchmark failed:', err.message);
    if (err.message.includes('connect ECONNREFUSED') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        console.error('   → Is "npm run dev" running?');
    }
    process.exit(1);
});
