/**
 * Authoritative game server entry point.
 * Runs the physics simulation via native Rust FFI and WebSocket transport.
 */
import { GameServer } from './server.js';
const PORT = parseInt(process.env.PORT || '8080', 10);
const TICK_RATE = parseInt(process.env.TICK_RATE || '60', 10);
const PRESET = process.env.PRESET || 'solar_system';
const SEED = parseInt(process.env.SEED || '42', 10);
async function main() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   Solar System Simulation Server v0.1    ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`  Port:      ${PORT}`);
    console.log(`  Tick Rate: ${TICK_RATE} Hz`);
    console.log(`  Preset:    ${PRESET}`);
    console.log(`  Seed:      ${SEED}`);
    console.log('');
    const server = new GameServer({
        port: PORT,
        tickRate: TICK_RATE,
        preset: PRESET,
        seed: SEED,
    });
    await server.start();
    // Graceful shutdown
    for (const sig of ['SIGINT', 'SIGTERM']) {
        process.on(sig, () => {
            console.log(`\nReceived ${sig}, shutting down...`);
            server.stop();
            process.exit(0);
        });
    }
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map