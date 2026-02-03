/**
 * N-Body Space Simulator - Authoritative Server
 * 
 * This server:
 * - Runs the canonical physics simulation
 * - Broadcasts state to all connected clients at 60 Hz
 * - Handles player inputs and chat
 * - Manages world presets and checkpoints
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { GameServer } from './game-server.js';
import { loadPreset } from './presets.js';

// Configuration from environment
const PORT = parseInt(process.env.PORT || '3000', 10);
const TICK_RATE = parseInt(process.env.TICK_RATE || '60', 10);
const MAX_CLIENTS = parseInt(process.env.MAX_CLIENTS || '32', 10);
const PRESET = process.env.PRESET || 'solar_system';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     N-Body Space Simulator - Authoritative Server          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();

    // Create Express app for HTTP endpoints
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Create HTTP server
    const httpServer = createServer(app);

    // Create game server
    const gameServer = new GameServer({
        tickRate: TICK_RATE,
        maxClients: MAX_CLIENTS,
    });

    // Initialize game server with WebSocket
    await gameServer.initialize(httpServer);

    // Load initial world preset
    console.log(`Loading preset: ${PRESET}`);
    const preset = await loadPreset(PRESET);
    if (preset) {
        gameServer.loadWorld(preset);
        console.log(`Loaded ${preset.bodies.length} bodies from preset`);
    }

    // HTTP API endpoints
    app.get('/api/status', (req, res) => {
        res.json(gameServer.getStatus());
    });

    app.get('/api/bodies', (req, res) => {
        res.json(gameServer.getBodies());
    });

    app.get('/api/checkpoint', (req, res) => {
        res.json(gameServer.createCheckpoint());
    });

    app.post('/api/checkpoint', (req, res) => {
        try {
            gameServer.restoreCheckpoint(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: String(error) });
        }
    });

    app.get('/api/presets', async (req, res) => {
        const presets = ['solar_system', 'earth_moon', 'two_body'];
        res.json(presets);
    });

    app.post('/api/preset/:name', async (req, res) => {
        const preset = await loadPreset(req.params.name);
        if (preset) {
            gameServer.loadWorld(preset);
            res.json({ success: true, bodies: preset.bodies.length });
        } else {
            res.status(404).json({ error: 'Preset not found' });
        }
    });

    app.post('/api/body', (req, res) => {
        try {
            gameServer.addBody(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: String(error) });
        }
    });

    app.delete('/api/body/:id', (req, res) => {
        try {
            gameServer.removeBody(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: String(error) });
        }
    });

    // Start server
    httpServer.listen(PORT, () => {
        console.log();
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
        console.log(`Tick rate: ${TICK_RATE} Hz`);
        console.log(`Max clients: ${MAX_CLIENTS}`);
        console.log();
        console.log('Press Ctrl+C to stop');
    });

    // Start game loop
    gameServer.start();

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down...');
        gameServer.stop();
        httpServer.close();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        gameServer.stop();
        httpServer.close();
        process.exit(0);
    });
}

main().catch(console.error);
