/**
 * Authoritative Game Server
 * ==========================
 * Runs the physics simulation and validates all state.
 * Clients are only allowed to send input; server calculates all physics.
 */
import { WebSocketServer } from 'ws';
import { createPhysicsEngine, getPresetWorld, Vector3, PHYSICS_TIMESTEP, NETWORK_TIMESTEP, MessageType, createMessage, WorldBuilderActionType, encodeBodyStates, buildIdHashMap } from '@space-sim/shared';
import { DEFAULT_SERVER_CONFIG } from './config.js';
import { SessionManager } from './SessionManager.js';
/**
 * Game Server
 */
export class GameServer {
    config;
    wss = null;
    physics;
    sessions;
    // Timing
    lastPhysicsUpdate = 0;
    lastNetworkUpdate = 0;
    isRunning = false;
    isPaused = false;
    // World
    currentWorld = null;
    bodyIdHashMap = new Map();
    // Tick counters
    physicsTick = 0;
    networkTick = 0;
    constructor(config = {}) {
        this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
        this.physics = createPhysicsEngine(this.config.physics);
        this.sessions = new SessionManager();
        // Set up physics callbacks
        this.physics.setCallbacks({
            onCollision: (event) => {
                console.log(`Collision: ${event.bodyA.name} <-> ${event.bodyB.name}`);
            },
            onSOITransition: (event) => {
                console.log(`SOI transition: ${event.body.name} from ${event.from?.name ?? 'space'} to ${event.to?.name ?? 'space'}`);
            }
        });
    }
    /**
     * Start the server
     */
    async start() {
        // Load default world
        this.loadWorld(this.config.defaultWorld);
        // Start WebSocket server
        this.wss = new WebSocketServer({ port: this.config.port });
        this.wss.on('connection', (socket) => {
            this.handleConnection(socket);
        });
        this.wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
        console.log(`Game server started on port ${this.config.port}`);
        console.log(`Loaded world: ${this.currentWorld?.name}`);
        // Start game loop
        this.isRunning = true;
        this.lastPhysicsUpdate = performance.now();
        this.lastNetworkUpdate = performance.now();
        this.gameLoop();
    }
    /**
     * Stop the server
     */
    stop() {
        this.isRunning = false;
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
        console.log('Game server stopped');
    }
    /**
     * Load a world by name
     */
    loadWorld(name) {
        const world = getPresetWorld(name);
        if (!world) {
            throw new Error(`Unknown world: ${name}`);
        }
        this.currentWorld = world;
        this.physics.loadWorld(world);
        // Build ID hash map for binary protocol
        this.bodyIdHashMap = buildIdHashMap(world.bodies.map(b => b.id));
        // Broadcast new world to all clients
        this.broadcastWorldState();
        console.log(`World loaded: ${world.name} (${world.bodies.length} bodies)`);
    }
    /**
     * Handle new WebSocket connection
     */
    handleConnection(socket) {
        console.log('New connection');
        socket.on('message', (data) => {
            this.handleMessage(socket, data);
        });
        socket.on('close', () => {
            this.handleDisconnect(socket);
        });
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }
    /**
     * Handle WebSocket message
     */
    handleMessage(socket, data) {
        try {
            // Handle binary messages (input)
            if (data instanceof Buffer || data instanceof ArrayBuffer) {
                this.handleBinaryMessage(socket, data);
                return;
            }
            // Parse JSON message
            const message = JSON.parse(data.toString());
            this.handleJSONMessage(socket, message);
        }
        catch (error) {
            console.error('Error handling message:', error);
            this.sendError(socket, 'PARSE_ERROR', 'Failed to parse message');
        }
    }
    /**
     * Handle JSON message
     */
    handleJSONMessage(socket, message) {
        const session = this.sessions.getSessionBySocket(socket);
        switch (message.type) {
            case MessageType.JOIN:
                this.handleJoin(socket, message);
                break;
            case MessageType.PING:
                this.handlePing(socket, session, message);
                break;
            case MessageType.PLAYER_INPUT:
                if (session) {
                    this.handlePlayerInput(session, message);
                }
                break;
            case MessageType.CHAT_MESSAGE:
                if (session) {
                    this.handleChat(session, message);
                }
                break;
            case MessageType.WORLD_BUILDER_ACTION:
                if (session) {
                    this.handleWorldBuilderAction(session, message);
                }
                break;
            case MessageType.CONFIG_UPDATE:
                if (session) {
                    this.handleConfigUpdate(session, message);
                }
                break;
            case MessageType.TIME_SCALE:
                if (session) {
                    this.handleTimeScale(session, message);
                }
                break;
            case MessageType.PAUSE:
                this.isPaused = true;
                this.sessions.broadcastSystemMessage('Simulation paused', 'info');
                break;
            case MessageType.RESUME:
                this.isPaused = false;
                this.sessions.broadcastSystemMessage('Simulation resumed', 'info');
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    /**
     * Handle binary message (reserved for future use)
     */
    handleBinaryMessage(_socket, _data) {
        // Binary messages could be used for input streaming
        // For now, we use JSON for all input
    }
    /**
     * Handle player join
     */
    handleJoin(socket, message) {
        if (this.sessions.getPlayerCount() >= this.config.maxPlayers) {
            this.sendError(socket, 'SERVER_FULL', 'Server is full');
            socket.close();
            return;
        }
        const session = this.sessions.createSession(socket, message.playerName);
        // Find spawn body (prefer Earth or first planet)
        let spawnBody = this.physics.getBody('earth');
        if (!spawnBody) {
            const bodies = this.physics.getMassiveBodies();
            spawnBody = bodies.find(b => b.bodyClass === 'terrestrial') ?? bodies[0];
        }
        if (spawnBody) {
            this.sessions.spawnPlayerOnBody(session, spawnBody);
        }
        // Send joined confirmation
        const joinedMessage = createMessage(MessageType.JOINED, {
            playerId: session.id,
            playerName: session.player.name,
            spawnBodyId: spawnBody?.id ?? '',
            spawnPosition: session.player.position.toArray(),
            serverConfig: this.physics.getConfig()
        });
        this.sessions.sendToSession(session, joinedMessage);
        // Send current world state
        this.sendWorldState(session);
        // Broadcast player joined
        this.sessions.broadcastPlayerJoined(session);
        console.log(`Player joined: ${message.playerName} (${session.id})`);
    }
    /**
     * Handle ping
     */
    handlePing(socket, session, message) {
        if (session) {
            this.sessions.updatePing(session, message.clientTime);
        }
        const pong = createMessage(MessageType.PONG, {
            clientTime: message.clientTime,
            serverTime: Date.now()
        });
        socket.send(JSON.stringify(pong));
    }
    /**
     * Handle player input
     */
    handlePlayerInput(session, message) {
        // Validate that the input is from the correct player
        if (message.playerId !== session.id) {
            return;
        }
        // Apply input
        this.sessions.applyPlayerInput(session, message.input, PHYSICS_TIMESTEP);
    }
    /**
     * Handle chat message
     */
    handleChat(session, message) {
        // Check for commands
        if (message.message.startsWith('/')) {
            this.handleCommand(session, message.message);
            return;
        }
        this.sessions.broadcastChat(session, message.message);
    }
    /**
     * Handle chat commands
     */
    handleCommand(session, command) {
        const parts = command.slice(1).split(' ');
        const cmd = parts[0]?.toLowerCase();
        switch (cmd) {
            case 'build':
                session.player.enterWorldBuilderMode();
                this.sendSystemMessage(session, 'Entered world builder mode. Type /exit to return.', 'success');
                break;
            case 'exit':
                session.player.exitWorldBuilderMode();
                this.sendSystemMessage(session, 'Exited world builder mode.', 'info');
                break;
            case 'help':
                this.sendSystemMessage(session, 'Commands: /build, /exit, /tp <body>, /time <scale>, /spawn <world>', 'info');
                break;
            case 'tp':
            case 'teleport':
                const bodyName = parts.slice(1).join(' ');
                const body = this.physics.getAllBodies().find(b => b.name.toLowerCase() === bodyName.toLowerCase() || b.id === bodyName);
                if (body) {
                    session.player.spawnOnBody(body);
                    this.sendSystemMessage(session, `Teleported to ${body.name}`, 'success');
                }
                else {
                    this.sendSystemMessage(session, `Unknown body: ${bodyName}`, 'error');
                }
                break;
            case 'time':
                const scale = parseFloat(parts[1] ?? '1');
                if (!isNaN(scale) && scale >= 0) {
                    this.physics.setTimeScale(scale);
                    this.sessions.broadcastSystemMessage(`Time scale set to ${scale}x`, 'info');
                }
                break;
            case 'spawn':
            case 'world':
                const worldName = parts.slice(1).join(' ');
                try {
                    this.loadWorld(worldName);
                    this.sessions.broadcastSystemMessage(`Loaded world: ${this.currentWorld?.name}`, 'success');
                }
                catch {
                    this.sendSystemMessage(session, `Unknown world: ${worldName}`, 'error');
                }
                break;
            default:
                this.sendSystemMessage(session, `Unknown command: ${cmd}`, 'error');
        }
    }
    /**
     * Handle world builder action
     */
    handleWorldBuilderAction(session, message) {
        if (session.player.mode !== 'world_builder') {
            return;
        }
        switch (message.action) {
            case WorldBuilderActionType.CREATE:
                if (message.bodyDefinition) {
                    const body = this.physics.addBody(message.bodyDefinition);
                    this.bodyIdHashMap.set(this.hashString(body.id), body.id);
                    this.sessions.broadcastSystemMessage(`Created body: ${body.name}`, 'info');
                }
                break;
            case WorldBuilderActionType.DELETE:
                if (message.bodyId) {
                    const body = this.physics.getBody(message.bodyId);
                    if (body) {
                        this.physics.removeBody(message.bodyId);
                        this.sessions.broadcastSystemMessage(`Deleted body: ${body.name}`, 'info');
                    }
                }
                break;
            case WorldBuilderActionType.MODIFY:
                if (message.bodyId && message.bodyDefinition) {
                    const body = this.physics.getBody(message.bodyId);
                    if (body) {
                        // Apply modifications
                        Object.assign(body, message.bodyDefinition);
                        this.sessions.broadcastSystemMessage(`Modified body: ${body.name}`, 'info');
                    }
                }
                break;
            case WorldBuilderActionType.TELEPORT:
                if (message.bodyId) {
                    const body = this.physics.getBody(message.bodyId);
                    if (body) {
                        session.player.spawnOnBody(body);
                    }
                }
                break;
        }
    }
    /**
     * Handle configuration update
     */
    handleConfigUpdate(_session, message) {
        this.physics.setConfig(message.config);
        this.sessions.broadcastSystemMessage('Physics configuration updated', 'info');
    }
    /**
     * Handle time scale change
     */
    handleTimeScale(_session, message) {
        this.physics.setTimeScale(message.scale);
        this.sessions.broadcastSystemMessage(`Time scale: ${message.scale}x`, 'info');
    }
    /**
     * Handle disconnect
     */
    handleDisconnect(socket) {
        const session = this.sessions.getSessionBySocket(socket);
        if (session) {
            console.log(`Player disconnected: ${session.player.name}`);
            this.sessions.broadcastPlayerLeft(session);
            this.sessions.removeSession(session);
        }
    }
    /**
     * Send error message
     */
    sendError(socket, code, message) {
        const error = createMessage(MessageType.ERROR, { code, message });
        socket.send(JSON.stringify(error));
    }
    /**
     * Send system message to session
     */
    sendSystemMessage(session, text, level) {
        const message = createMessage(MessageType.SYSTEM_MESSAGE, {
            message: text,
            level
        });
        this.sessions.sendToSession(session, message);
    }
    /**
     * Send world state to session
     */
    sendWorldState(session) {
        if (!this.currentWorld)
            return;
        const bodies = this.physics.getAllBodies().map(b => b.toDefinition());
        const message = createMessage(MessageType.WORLD_STATE, {
            worldName: this.currentWorld.name,
            worldDescription: this.currentWorld.description,
            seed: this.currentWorld.seed,
            bodies,
            simulationTime: this.physics.getTime(),
            tick: this.physics.getTick()
        });
        this.sessions.sendToSession(session, message);
    }
    /**
     * Broadcast world state to all clients
     */
    broadcastWorldState() {
        if (!this.currentWorld)
            return;
        const bodies = this.physics.getAllBodies().map(b => b.toDefinition());
        const message = createMessage(MessageType.WORLD_STATE, {
            worldName: this.currentWorld.name,
            worldDescription: this.currentWorld.description,
            seed: this.currentWorld.seed,
            bodies,
            simulationTime: this.physics.getTime(),
            tick: this.physics.getTick()
        });
        this.sessions.broadcast(message);
    }
    /**
     * Broadcast world delta (body states only)
     */
    broadcastWorldDelta() {
        const bodyStates = this.physics.getAllBodies().map(b => b.toNetworkState(Date.now()));
        // Send binary for efficiency
        const binary = encodeBodyStates(bodyStates, this.networkTick);
        this.sessions.broadcastBinary(binary);
        // Also send player states (JSON)
        const playerStates = this.sessions.getPlayerStates();
        if (playerStates.length > 0) {
            const message = createMessage(MessageType.PLAYER_STATE, {
                players: playerStates
            });
            this.sessions.broadcast(message);
        }
    }
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning)
            return;
        const now = performance.now();
        // Physics update
        if (!this.isPaused) {
            const physicsElapsed = (now - this.lastPhysicsUpdate) / 1000;
            this.physics.update(physicsElapsed);
            this.lastPhysicsUpdate = now;
            this.physicsTick++;
            // Update players
            for (const session of this.sessions.getConnectedSessions()) {
                const player = session.player;
                // Apply gravity from dominant body
                if (player.currentBody) {
                    const gravityDir = Vector3.sub(player.currentBody.position, player.position);
                    const distance = gravityDir.length();
                    if (distance > 0) {
                        const gravityMag = player.currentBody.getGravitationalAcceleration(distance);
                        const gravity = gravityDir.multiplyScalar(gravityMag / distance);
                        player.updatePhysics(physicsElapsed, gravity);
                    }
                }
                // Check collisions with bodies
                for (const body of this.physics.getMassiveBodies()) {
                    player.checkCollision(body);
                }
            }
        }
        // Network update
        const networkElapsed = (now - this.lastNetworkUpdate) / 1000;
        if (networkElapsed >= NETWORK_TIMESTEP) {
            this.broadcastWorldDelta();
            this.lastNetworkUpdate = now;
            this.networkTick++;
            // Check for timeouts
            const timedOut = this.sessions.checkTimeouts();
            for (const session of timedOut) {
                console.log(`Session timed out: ${session.id}`);
                this.sessions.broadcastPlayerLeft(session, 'timeout');
                this.sessions.removeSession(session);
            }
        }
        // Schedule next frame (target 60 FPS)
        setImmediate(() => this.gameLoop());
    }
    /**
     * Simple string hash
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash + char) >>> 0;
        }
        return hash;
    }
    /**
     * Get server status
     */
    getStatus() {
        return {
            players: this.sessions.getPlayerCount(),
            bodies: this.physics.getAllBodies().length,
            tick: this.physicsTick,
            time: this.physics.getTime(),
            timeScale: this.physics.getTimeScale(),
            paused: this.isPaused
        };
    }
}
/**
 * Create and start the game server
 */
export async function startServer(config) {
    const server = new GameServer(config);
    await server.start();
    return server;
}
//# sourceMappingURL=GameServer.js.map