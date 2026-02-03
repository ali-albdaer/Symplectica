/**
 * WebSocket network client
 */

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface SnapshotBody {
    id: string;
    name: string;
    bodyType: string;
    mass: number;
    radius: number;
    position: Vec3;
    velocity: Vec3;
    soi?: number;
    ownerId?: string;
    visuals?: {
        color: number;
        emission?: number;
    };
}

export interface NetworkSnapshot {
    tick: number;
    time: number;
    bodies: SnapshotBody[];
    prngState?: number[];
}

export interface ClientMessage {
    type: string;
    payload: Record<string, unknown>;
}

export interface ServerMessage {
    type: string;
    payload: Record<string, unknown>;
}

type MessageHandler = (msg: ServerMessage) => void;
type ConnectionHandler = () => void;

export class NetworkClient {
    private ws: WebSocket | null = null;
    private messageHandlers: MessageHandler[] = [];
    private disconnectHandlers: ConnectionHandler[] = [];
    private reconnectHandlers: ConnectionHandler[] = [];

    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;

    private pingStart = 0;
    private ping = 0;

    private serverUrl: string;

    constructor() {
        // Determine WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        // @ts-ignore - Vite provides import.meta.env
        const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV;
        const port = isDev ? '3000' : window.location.port;
        this.serverUrl = `${protocol}//${host}:${port}/ws`;
    }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        console.log('Connecting to:', this.serverUrl);
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.reconnectAttempts = 0;

            // Start ping measurement
            this.measurePing();
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data as string) as ServerMessage;

                // Handle ping response
                if (msg.type === 'pong') {
                    this.ping = performance.now() - this.pingStart;
                    return;
                }

                this.messageHandlers.forEach((handler) => handler(msg));
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.disconnectHandlers.forEach((handler) => handler());
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect();
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.reconnectHandlers.forEach((handler) => handler());
            }
        }, delay);
    }

    private measurePing(): void {
        setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.pingStart = performance.now();
                this.send({ type: 'ping', payload: {} });
            }
        }, 1000);
    }

    send(msg: ClientMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    onMessage(handler: MessageHandler): void {
        this.messageHandlers.push(handler);
    }

    onDisconnect(handler: ConnectionHandler): void {
        this.disconnectHandlers.push(handler);
    }

    onReconnect(handler: ConnectionHandler): void {
        this.reconnectHandlers.push(handler);
    }

    getPing(): number {
        return Math.round(this.ping);
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}
