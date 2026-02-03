/**
 * Main game controller
 */

import { Renderer } from './renderer';
import { NetworkClient, ServerMessage, NetworkSnapshot } from './network';
import { InputManager } from './input';
import { HUD } from './hud';
import { Chat } from './chat';
import { BodyManager, ClientBody } from './bodies';

export class Game {
    private renderer: Renderer;
    private network: NetworkClient;
    private input: InputManager;
    private hud: HUD;
    private chat: Chat;
    private bodies: BodyManager;

    private playerName = '';
    private playerId = '';
    private running = false;
    private lastFrameTime = 0;
    private frameCount = 0;
    private fps = 0;
    private lastFpsUpdate = 0;

    // Snapshot interpolation
    private prevSnapshot: NetworkSnapshot | null = null;
    private currSnapshot: NetworkSnapshot | null = null;
    private snapshotTime = 0;

    // Camera target
    private cameraTarget: ClientBody | null = null;
    private freeCam = true;

    constructor() {
        this.renderer = new Renderer();
        this.network = new NetworkClient();
        this.input = new InputManager();
        this.hud = new HUD();
        this.chat = new Chat();
        this.bodies = new BodyManager(this.renderer);

        this.setupNetworkHandlers();
        this.setupChatHandlers();
    }

    start(playerName: string): void {
        this.playerName = playerName;
        this.renderer.init();
        this.network.connect();
        this.running = true;
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = this.lastFrameTime;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private setupNetworkHandlers(): void {
        this.network.onMessage((msg: ServerMessage) => {
            switch (msg.type) {
                case 'welcome':
                    this.playerId = msg.payload.playerId as string;
                    this.network.send({
                        type: 'join',
                        payload: { name: this.playerName },
                    });
                    break;

                case 'joined':
                    this.chat.addSystem(`Connected as ${this.playerName}`);
                    break;

                case 'snapshot':
                    this.handleSnapshot(msg.payload as unknown as NetworkSnapshot);
                    break;

                case 'player_joined':
                    this.chat.addSystem(`${msg.payload.name} joined the simulation`);
                    break;

                case 'player_left':
                    this.chat.addSystem(`${msg.payload.name} left the simulation`);
                    break;

                case 'chat':
                    this.chat.addPlayer(msg.payload.from as string, msg.payload.message as string);
                    break;

                case 'error':
                    this.chat.addSystem(`Error: ${msg.payload.message}`);
                    break;
            }
        });

        this.network.onDisconnect(() => {
            this.chat.addSystem('Disconnected from server');
            document.getElementById('connection-status')!.style.display = 'block';
        });

        this.network.onReconnect(() => {
            document.getElementById('connection-status')!.style.display = 'none';
            this.chat.addSystem('Reconnected to server');
            if (this.playerName) {
                this.network.send({
                    type: 'join',
                    payload: { name: this.playerName },
                });
            }
        });
    }

    private setupChatHandlers(): void {
        this.chat.onSend((message: string) => {
            // Handle commands
            if (message.startsWith('/')) {
                this.handleCommand(message.slice(1));
                return;
            }

            // Send chat message
            this.network.send({
                type: 'chat',
                payload: { message },
            });
        });
    }

    private handleCommand(cmd: string): void {
        const parts = cmd.split(' ');
        const command = parts[0]?.toLowerCase();

        switch (command) {
            case 'help':
                this.chat.addSystem('Commands: /help, /follow <body>, /freecam, /goto <body>, /list');
                break;

            case 'follow':
                const targetName = parts.slice(1).join(' ');
                const target = this.bodies.findByName(targetName);
                if (target) {
                    this.cameraTarget = target;
                    this.freeCam = false;
                    this.chat.addSystem(`Following ${target.name}`);
                } else {
                    this.chat.addSystem(`Body '${targetName}' not found`);
                }
                break;

            case 'freecam':
                this.freeCam = true;
                this.cameraTarget = null;
                this.chat.addSystem('Free camera enabled');
                break;

            case 'goto':
                const gotoName = parts.slice(1).join(' ');
                const gotoTarget = this.bodies.findByName(gotoName);
                if (gotoTarget) {
                    this.renderer.setCameraPosition(
                        gotoTarget.position.x,
                        gotoTarget.position.y,
                        gotoTarget.position.z + gotoTarget.radius * 5
                    );
                    this.chat.addSystem(`Moved to ${gotoTarget.name}`);
                } else {
                    this.chat.addSystem(`Body '${gotoName}' not found`);
                }
                break;

            case 'list':
                const bodyList = this.bodies.getAll().map(b => b.name).join(', ');
                this.chat.addSystem(`Bodies: ${bodyList}`);
                break;

            default:
                this.chat.addSystem(`Unknown command: ${command}`);
        }
    }

    private handleSnapshot(snapshot: NetworkSnapshot): void {
        this.prevSnapshot = this.currSnapshot;
        this.currSnapshot = snapshot;
        this.snapshotTime = performance.now();

        // Update body visuals
        this.bodies.updateFromSnapshot(snapshot);

        // Update HUD stats
        this.hud.setTick(snapshot.tick);
        this.hud.setBodies(snapshot.bodies.length);
    }

    private gameLoop(time: number): void {
        if (!this.running) return;

        const dt = (time - this.lastFrameTime) / 1000;
        this.lastFrameTime = time;

        // FPS calculation
        this.frameCount++;
        if (time - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = time;
            this.hud.setFps(this.fps);
        }

        // Process input
        this.processInput(dt);

        // Interpolate bodies
        this.interpolateBodies(time);

        // Update camera follow
        if (!this.freeCam && this.cameraTarget) {
            this.renderer.setCameraTarget(
                this.cameraTarget.position.x,
                this.cameraTarget.position.y,
                this.cameraTarget.position.z
            );
        }

        // Render
        this.renderer.render();

        // Update HUD
        this.updateHUD();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private processInput(dt: number): void {
        const moveSpeed = this.renderer.getCameraDistance() * dt;

        if (this.input.isKeyDown('KeyW')) {
            this.renderer.moveCamera(0, 0, -moveSpeed);
        }
        if (this.input.isKeyDown('KeyS')) {
            this.renderer.moveCamera(0, 0, moveSpeed);
        }
        if (this.input.isKeyDown('KeyA')) {
            this.renderer.moveCamera(-moveSpeed, 0, 0);
        }
        if (this.input.isKeyDown('KeyD')) {
            this.renderer.moveCamera(moveSpeed, 0, 0);
        }
        if (this.input.isKeyDown('Space')) {
            this.renderer.moveCamera(0, moveSpeed, 0);
        }
        if (this.input.isKeyDown('ShiftLeft') || this.input.isKeyDown('ShiftRight')) {
            this.renderer.moveCamera(0, -moveSpeed, 0);
        }

        // Handle mouse drag for camera rotation
        const mouseDelta = this.input.getMouseDelta();
        if (this.input.isMouseDown(0)) {
            this.renderer.rotateCamera(mouseDelta.x * 0.005, mouseDelta.y * 0.005);
        }

        // Zoom with scroll
        const scroll = this.input.getScrollDelta();
        if (scroll !== 0) {
            this.renderer.zoom(scroll * 0.001);
        }

        this.input.update();
    }

    private interpolateBodies(time: number): void {
        if (!this.currSnapshot) return;

        // Simple linear interpolation between snapshots
        const tickDuration = 1000 / 60; // 60 Hz
        const timeSinceSnapshot = time - this.snapshotTime;
        const t = Math.min(1, timeSinceSnapshot / tickDuration);

        if (this.prevSnapshot && this.prevSnapshot.tick === this.currSnapshot.tick - 1) {
            this.bodies.interpolate(this.prevSnapshot, this.currSnapshot, t);
        }
    }

    private updateHUD(): void {
        const camPos = this.renderer.getCameraPosition();
        this.hud.setPosition(camPos.x, camPos.y, camPos.z);

        // Find nearest body
        const nearest = this.bodies.findNearest(camPos.x, camPos.y, camPos.z);
        if (nearest) {
            this.hud.setNearBody(nearest.name);
            this.hud.setSOI(nearest.soi || 0);
        }

        this.hud.setPing(this.network.getPing());
    }

    dispose(): void {
        this.running = false;
        this.network.disconnect();
        this.renderer.dispose();
        this.input.dispose();
    }
}
