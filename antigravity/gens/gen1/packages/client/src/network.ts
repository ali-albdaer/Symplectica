/**
 * Network Client
 * 
 * WebSocket client for connecting to authoritative server:
 * - Server state reconciliation
 * - Client prediction and rollback
 * - Latency measurement
 */

interface ServerMessage {
    type: 'welcome' | 'state' | 'snapshot' | 'pong' | 'error' | 'chat' | 'admin_state' | 'visualization_state';
    payload: unknown;
    serverTick?: number;
    timestamp?: number;
}

interface StatePayload {
    tick: number;
    time: number;
    positions: number[];
    energy: number;
}

interface WelcomePayload {
    clientId: string;
    displayName?: string;
    snapshot: string;
    players?: string[];
    config: {
        tickRate: number;
        serverTick: number;
        adminState?: AdminStatePayload;
        visualizationState?: VisualizationStatePayload;
    };
}

interface ChatPayload {
    sender: string;
    text: string;
}

export interface AdminStatePayload {
    dt: number;
    substeps: number;
    forceMethod: 'direct' | 'barnes-hut';
    theta: number;
    timeScale: number;
    paused: boolean;
    simMode: 'tick' | 'accumulator';
}

export interface VisualizationStatePayload {
    showOrbitTrails: boolean;
    showLabels: boolean;
    showGridXY: boolean;
    showGridXZ: boolean;
    showGridYZ: boolean;
    gridSpacing: number;
    gridSize: number;
    orbitTrailLength: number;
    realScale: boolean;
    bodyScale: number;
}

type MessageHandler = (message: ServerMessage) => void;

export class NetworkClient {
    private ws: WebSocket | null = null;
    private url: string;
    private clientId: string | null = null;
    private handlers: Map<string, MessageHandler[]> = new Map();

    // Latency tracking
    private pingStart = 0;
    private latency = 0;
    private latencyHistory: number[] = [];

    // Server state
    private serverTick = 0;
    private lastServerTime = 0;

    // Reconnection
    private reconnecting = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;

    constructor(url: string = 'ws://localhost:8080') {
        this.url = url;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`🌐 Connecting to ${this.url}...`);

            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('✅ Connected to server');
                this.reconnecting = false;
                this.reconnectAttempts = 0;
                resolve();
            };

            this.ws.onclose = () => {
                console.log('🔌 Disconnected from server');
                this.handleDisconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (!this.reconnecting) {
                    reject(error);
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ServerMessage;
                    this.handleMessage(message);
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            };
        });
    }

    private handleMessage(message: ServerMessage): void {
        // Update server tick
        if (message.serverTick !== undefined) {
            this.serverTick = message.serverTick;
        }

        if (message.timestamp !== undefined) {
            this.lastServerTime = message.timestamp;
        }

        switch (message.type) {
            case 'welcome':
                this.handleWelcome(message.payload as WelcomePayload);
                break;

            case 'pong':
                this.handlePong();
                break;

            case 'state':
            case 'snapshot':
            case 'chat':
            case 'admin_state':
            case 'visualization_state':
            case 'error':
                // Dispatch to registered handlers
                const handlers = this.handlers.get(message.type) || [];
                for (const handler of handlers) {
                    handler(message);
                }
                break;
        }
    }

    private handleWelcome(payload: WelcomePayload): void {
        this.clientId = payload.clientId;
        this.serverTick = payload.config.serverTick;

        console.log(`👋 Welcome! Client ID: ${this.clientId}`);
        console.log(`   Server tick: ${this.serverTick}`);
        console.log(`   Tick rate: ${payload.config.tickRate} Hz`);

        // Dispatch to handlers
        const handlers = this.handlers.get('welcome') || [];
        for (const handler of handlers) {
            handler({ type: 'welcome', payload });
        }
    }

    private handlePong(): void {
        const roundTrip = performance.now() - this.pingStart;
        this.latency = roundTrip / 2;

        this.latencyHistory.push(this.latency);
        if (this.latencyHistory.length > 30) {
            this.latencyHistory.shift();
        }
    }

    private handleDisconnect(): void {
        if (this.reconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        this.reconnecting = true;
        this.reconnectAttempts++;

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            this.connect().catch(() => {
                this.reconnecting = false;
            });
        }, delay);
    }

    on(event: string, handler: MessageHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }

    off(event: string, handler: MessageHandler): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    send(type: string, payload?: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }

    sendChat(sender: string, text: string): void {
        this.send('chat', { sender, text } as ChatPayload);
    }

    sendAdminSettings(settings: AdminStatePayload): void {
        this.send('admin_settings', settings);
    }

    sendTimeScale(simSecondsPerRealSecond: number): void {
        this.send('set_time_scale', { simSecondsPerRealSecond });
    }

    sendSnapshot(snapshot: string): void {
        this.send('apply_snapshot', { snapshot });
    }

    resetSimulation(): void {
        this.send('reset_simulation');
    }

    sendVisualizationSettings(settings: VisualizationStatePayload): void {
        this.send('set_visualization', settings);
    }

    sendPause(paused: boolean): void {
        this.send('set_pause', { paused });
    }

    ping(): void {
        this.pingStart = performance.now();
        this.send('ping', { clientTick: this.serverTick });
    }

    requestSnapshot(): void {
        this.send('request_snapshot');
    }

    getLatency(): number {
        return this.latency;
    }

    getAverageLatency(): number {
        if (this.latencyHistory.length === 0) return 0;
        return this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    }

    getServerTick(): number {
        return this.serverTick;
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    disconnect(): void {
        this.reconnecting = false;
        this.reconnectAttempts = this.maxReconnectAttempts;

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
