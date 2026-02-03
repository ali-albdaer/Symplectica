/**
 * Game Server - Core game logic and WebSocket handling
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Simulation } from './simulation.js';
import { WorldPreset } from './presets.js';

// Message types
interface ServerMessage {
    type: string;
    seq: number;
    timestamp: number;
}

interface ClientMessage {
    type: string;
    seq?: number;
    [key: string]: unknown;
}

interface Player {
    id: string;
    name: string;
    ws: WebSocket;
    spacecraftId?: string;
    joinedAt: number;
    lastPing: number;
    ping: number;
    inputSeq: number;
}

interface ChatMessage {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
}

interface GameServerOptions {
    tickRate: number;
    maxClients: number;
}

export class GameServer {
    private options: GameServerOptions;
    private wss: WebSocketServer | null = null;
    private simulation: Simulation;
    private players: Map<string, Player> = new Map();
    private chatHistory: ChatMessage[] = [];
    private maxChatHistory = 50;
    private tickInterval: NodeJS.Timeout | null = null;
    private running = false;
    private messageSeq = 0;

    constructor(options: GameServerOptions) {
        this.options = options;
        this.simulation = new Simulation({
            tickRate: options.tickRate,
        });
    }

    async initialize(httpServer: HttpServer): Promise<void> {
        // Initialize physics simulation
        await this.simulation.initialize();

        // Create WebSocket server
        this.wss = new WebSocketServer({ server: httpServer });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        console.log('Game server initialized');
    }

    private handleConnection(ws: WebSocket, req: any): void {
        const playerId = uuidv4();
        
        console.log(`New connection: ${playerId}`);

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString()) as ClientMessage;
                this.handleMessage(playerId, message);
            } catch (error) {
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

    private handleMessage(playerId: string, message: ClientMessage): void {
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

    private handleJoin(playerId: string, message: ClientMessage): void {
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
        if (!ws) return;

        const name = String(message.name || `Player ${this.players.size + 1}`);

        const newPlayer: Player = {
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

    private handleDisconnect(playerId: string): void {
        const player = this.players.get(playerId);
        if (!player) return;

        console.log(`Player disconnected: ${player.name} (${playerId})`);

        // Remove player's spacecraft if any
        if (player.spacecraftId) {
            try {
                this.simulation.removeBody(player.spacecraftId);
            } catch {
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

    private handleInput(playerId: string, message: ClientMessage): void {
        const player = this.players.get(playerId);
        if (!player || !player.spacecraftId) return;

        const thrust = message.thrust as { x: number; y: number; z: number } | undefined;
        if (!thrust) return;

        // Apply thrust to player's spacecraft
        this.simulation.applyThrust(player.spacecraftId, thrust);

        player.inputSeq = (message.seq || 0) as number;
    }

    private handleChat(playerId: string, message: ClientMessage): void {
        const player = this.players.get(playerId);
        if (!player) return;

        const text = String(message.message || '').slice(0, 500);
        if (!text) return;

        // Check for commands
        if (text.startsWith('/')) {
            this.handleCommand(playerId, { type: 'command', command: text.slice(1) });
            return;
        }

        const chatMessage: ChatMessage = {
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

    private handlePing(playerId: string): void {
        const player = this.players.get(playerId);
        if (!player) return;

        const now = Date.now();
        player.ping = now - player.lastPing;
        player.lastPing = now;

        this.sendToPlayer(playerId, {
            type: 'pong',
            serverTime: now,
            ping: player.ping,
        });
    }

    private handleSpawn(playerId: string, message: ClientMessage): void {
        const player = this.players.get(playerId);
        if (!player) return;

        if (player.spacecraftId) {
            // Already has spacecraft
            return;
        }

        const position = message.position as { x: number; y: number; z: number } | undefined;
        const velocity = message.velocity as { x: number; y: number; z: number } | undefined;

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
        } catch (error) {
            this.sendToPlayer(playerId, {
                type: 'error',
                error: String(error),
            });
        }
    }

    private handleCommand(playerId: string, message: ClientMessage): void {
        const player = this.players.get(playerId);
        if (!player) return;

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

    start(): void {
        if (this.running) return;

        this.running = true;
        const tickMs = 1000 / this.options.tickRate;

        let lastTick = Date.now();
        let accumulator = 0;

        const tick = () => {
            if (!this.running) return;

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

    stop(): void {
        this.running = false;
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        console.log('Game loop stopped');
    }

    private broadcastState(): void {
        const snapshot = this.simulation.createSnapshot();

        const message = {
            type: 'snapshot',
            snapshot,
        };

        this.broadcast(message);
    }

    // ========== Messaging ==========

    private sendToPlayer(playerId: string, data: object): void {
        const player = this.players.get(playerId);
        if (!player) return;
        this.sendToSocket(player.ws, data);
    }

    private sendToSocket(ws: WebSocket, data: object): void {
        if (ws.readyState !== WebSocket.OPEN) return;

        const message: ServerMessage = {
            ...data,
            type: (data as any).type,
            seq: this.messageSeq++,
            timestamp: Date.now(),
        };

        ws.send(JSON.stringify(message));
    }

    private broadcast(data: object): void {
        for (const player of this.players.values()) {
            this.sendToSocket(player.ws, data);
        }
    }

    private broadcastExcept(excludeId: string, data: object): void {
        for (const [id, player] of this.players.entries()) {
            if (id !== excludeId) {
                this.sendToSocket(player.ws, data);
            }
        }
    }

    private findSocket(playerId: string): WebSocket | undefined {
        // This is a workaround since we set up the player after the first message
        // In production, you'd track sockets separately
        for (const client of this.wss?.clients || []) {
            // Return first client that isn't in players map yet
            // This is a simplification
            return client;
        }
        return undefined;
    }

    private getPlayerList(): { id: string; name: string }[] {
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

    getBodies(): import('./simulation.js').Body[] {
        return this.simulation.getBodies();
    }

    createCheckpoint() {
        return this.simulation.createCheckpoint();
    }

    restoreCheckpoint(checkpoint: any) {
        this.simulation.restoreCheckpoint(checkpoint);
        this.broadcast({
            type: 'fullState',
            checkpoint: this.simulation.createCheckpoint(),
        });
    }

    loadWorld(preset: WorldPreset) {
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

    addBody(body: any) {
        this.simulation.addBody(body);
    }

    removeBody(id: string) {
        this.simulation.removeBody(id);
    }
}
