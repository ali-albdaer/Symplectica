/**
 * Game Server - Core game logic and WebSocket handling
 */
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Simulation } from './simulation.js';
export class GameServer {
    options;
    wss = null;
    simulation;
    players = new Map();
    chatHistory = [];
    maxChatHistory = 50;
    tickInterval = null;
    running = false;
    messageSeq = 0;
    constructor(options) {
        this.options = options;
        this.simulation = new Simulation({
            tickRate: options.tickRate,
        });
    }
    async initialize(httpServer) {
        // Initialize physics simulation
        await this.simulation.initialize();
        // Create WebSocket server
        this.wss = new WebSocketServer({ server: httpServer });
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        console.log('Game server initialized');
    }
    handleConnection(ws, req) {
        const playerId = uuidv4();
        console.log(`New connection: ${playerId}`);
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(playerId, message);
            }
            catch (error) {
                console.error(`Invalid message from ${playerId}:`, error);
            }
        });
        ws.on('close', () => {
            this.handleDisconnect(playerId);
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error for ${playerId}:`, error);
        });
        // Send initial state
        this.sendToSocket(ws, {
            type: 'welcome',
            playerId,
            config: this.simulation.getConfig(),
        });
    }
    handleMessage(playerId, message) {
        switch (message.type) {
            case 'join':
                this.handleJoin(playerId, message);
                break;
            case 'input':
                this.handleInput(playerId, message);
                break;
            case 'chat':
                this.handleChat(playerId, message);
                break;
            case 'ping':
                this.handlePing(playerId);
                break;
            case 'spawn':
                this.handleSpawn(playerId, message);
                break;
            case 'command':
                this.handleCommand(playerId, message);
                break;
            default:
                console.warn(`Unknown message type: ${message.type}`);
        }
    }
    handleJoin(playerId, message) {
        const player = this.players.get(playerId);
        if (player) {
            console.warn(`Player ${playerId} already joined`);
            return;
        }
        if (this.players.size >= this.options.maxClients) {
            const ws = this.findSocket(playerId);
            if (ws) {
                this.sendToSocket(ws, {
                    type: 'error',
                    error: 'Server is full',
                });
                ws.close();
            }
            return;
        }
        const ws = this.findSocket(playerId);
        if (!ws)
            return;
        const name = String(message.name || `Player ${this.players.size + 1}`);
        const newPlayer = {
            id: playerId,
            name,
            ws,
            joinedAt: Date.now(),
            lastPing: Date.now(),
            ping: 0,
            inputSeq: 0,
        };
        this.players.set(playerId, newPlayer);
        console.log(`Player joined: ${name} (${playerId})`);
        // Send full state to new player
        this.sendToPlayer(playerId, {
            type: 'fullState',
            checkpoint: this.simulation.createCheckpoint(),
            players: this.getPlayerList(),
            chatHistory: this.chatHistory.slice(-10),
        });
        // Notify other players
        this.broadcastExcept(playerId, {
            type: 'playerJoin',
            player: {
                id: playerId,
                name,
            },
        });
    }
    handleDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        console.log(`Player disconnected: ${player.name} (${playerId})`);
        // Remove player's spacecraft if any
        if (player.spacecraftId) {
            try {
                this.simulation.removeBody(player.spacecraftId);
            }
            catch {
                // Ignore
            }
        }
        this.players.delete(playerId);
        // Notify other players
        this.broadcast({
            type: 'playerLeave',
            playerId,
        });
    }
    handleInput(playerId, message) {
        const player = this.players.get(playerId);
        if (!player || !player.spacecraftId)
            return;
        const thrust = message.thrust;
        if (!thrust)
            return;
        // Apply thrust to player's spacecraft
        this.simulation.applyThrust(player.spacecraftId, thrust);
        player.inputSeq = (message.seq || 0);
    }
    handleChat(playerId, message) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const text = String(message.message || '').slice(0, 500);
        if (!text)
            return;
        // Check for commands
        if (text.startsWith('/')) {
            this.handleCommand(playerId, { type: 'command', command: text.slice(1) });
            return;
        }
        const chatMessage = {
            playerId,
            playerName: player.name,
            message: text,
            timestamp: Date.now(),
        };
        this.chatHistory.push(chatMessage);
        if (this.chatHistory.length > this.maxChatHistory) {
            this.chatHistory.shift();
        }
        this.broadcast({
            type: 'chat',
            ...chatMessage,
        });
    }
    handlePing(playerId) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const now = Date.now();
        player.ping = now - player.lastPing;
        player.lastPing = now;
        this.sendToPlayer(playerId, {
            type: 'pong',
            serverTime: now,
            ping: player.ping,
        });
    }
    handleSpawn(playerId, message) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        if (player.spacecraftId) {
            // Already has spacecraft
            return;
        }
        const position = message.position;
        const velocity = message.velocity;
        const spacecraftId = `spacecraft_${playerId}`;
        try {
            this.simulation.addBody({
                id: spacecraftId,
                name: `${player.name}'s Ship`,
                mass: 10000, // 10 tonnes
                radius: 10,
                position: position || { x: 1.5e11, y: 0, z: 0 },
                velocity: velocity || { x: 0, y: 29780, z: 0 }, // Earth orbital velocity
                bodyType: 'Spacecraft',
                ownerId: playerId,
            });
            player.spacecraftId = spacecraftId;
            this.sendToPlayer(playerId, {
                type: 'spawned',
                spacecraftId,
            });
        }
        catch (error) {
            this.sendToPlayer(playerId, {
                type: 'error',
                error: String(error),
            });
        }
    }
    handleCommand(playerId, message) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const command = String(message.command || '');
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        switch (cmd) {
            case 'help':
                this.sendToPlayer(playerId, {
                    type: 'chat',
                    playerName: 'Server',
                    message: 'Commands: /help, /spawn, /preset <name>, /list, /status',
                    timestamp: Date.now(),
                });
                break;
            case 'status':
                this.sendToPlayer(playerId, {
                    type: 'chat',
                    playerName: 'Server',
                    message: `Tick: ${this.simulation.tick}, Bodies: ${this.simulation.bodyCount}, Players: ${this.players.size}`,
                    timestamp: Date.now(),
                });
                break;
            case 'list':
                const bodies = this.simulation.getBodyIds();
                this.sendToPlayer(playerId, {
                    type: 'chat',
                    playerName: 'Server',
                    message: `Bodies: ${bodies.join(', ')}`,
                    timestamp: Date.now(),
                });
                break;
            default:
                this.sendToPlayer(playerId, {
                    type: 'chat',
                    playerName: 'Server',
                    message: `Unknown command: ${cmd}. Type /help for commands.`,
                    timestamp: Date.now(),
                });
        }
    }
    // ========== Game Loop ==========
    start() {
        if (this.running)
            return;
        this.running = true;
        const tickMs = 1000 / this.options.tickRate;
        let lastTick = Date.now();
        let accumulator = 0;
        const tick = () => {
            if (!this.running)
                return;
            const now = Date.now();
            const delta = now - lastTick;
            lastTick = now;
            accumulator += delta;
            // Run physics ticks
            while (accumulator >= tickMs) {
                this.simulation.step();
                accumulator -= tickMs;
            }
            // Broadcast state to all clients
            this.broadcastState();
        };
        this.tickInterval = setInterval(tick, tickMs);
        console.log(`Game loop started at ${this.options.tickRate} Hz`);
    }
    stop() {
        this.running = false;
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        console.log('Game loop stopped');
    }
    broadcastState() {
        const snapshot = this.simulation.createSnapshot();
        const message = {
            type: 'snapshot',
            snapshot,
        };
        this.broadcast(message);
    }
    // ========== Messaging ==========
    sendToPlayer(playerId, data) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        this.sendToSocket(player.ws, data);
    }
    sendToSocket(ws, data) {
        if (ws.readyState !== WebSocket.OPEN)
            return;
        const message = {
            ...data,
            type: data.type,
            seq: this.messageSeq++,
            timestamp: Date.now(),
        };
        ws.send(JSON.stringify(message));
    }
    broadcast(data) {
        for (const player of this.players.values()) {
            this.sendToSocket(player.ws, data);
        }
    }
    broadcastExcept(excludeId, data) {
        for (const [id, player] of this.players.entries()) {
            if (id !== excludeId) {
                this.sendToSocket(player.ws, data);
            }
        }
    }
    findSocket(playerId) {
        // This is a workaround since we set up the player after the first message
        // In production, you'd track sockets separately
        for (const client of this.wss?.clients || []) {
            // Return first client that isn't in players map yet
            // This is a simplification
            return client;
        }
        return undefined;
    }
    getPlayerList() {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
        }));
    }
    // ========== Public API ==========
    getStatus() {
        return {
            running: this.running,
            tick: Number(this.simulation.tick),
            simTime: this.simulation.simTime,
            bodyCount: this.simulation.bodyCount,
            playerCount: this.players.size,
            tickRate: this.options.tickRate,
        };
    }
    getBodies() {
        return this.simulation.getBodies();
    }
    createCheckpoint() {
        return this.simulation.createCheckpoint();
    }
    restoreCheckpoint(checkpoint) {
        this.simulation.restoreCheckpoint(checkpoint);
        this.broadcast({
            type: 'fullState',
            checkpoint: this.simulation.createCheckpoint(),
        });
    }
    loadWorld(preset) {
        this.simulation.reset();
        for (const body of preset.bodies) {
            this.simulation.addBody(body);
        }
        this.simulation.initialize();
        this.broadcast({
            type: 'fullState',
            checkpoint: this.simulation.createCheckpoint(),
        });
    }
    addBody(body) {
        this.simulation.addBody(body);
    }
    removeBody(id) {
        this.simulation.removeBody(id);
    }
}
//# sourceMappingURL=game-server.js.map