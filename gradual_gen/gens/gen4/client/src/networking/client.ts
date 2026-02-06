/**
 * WebSocket network client with auto-reconnect, ping/pong, and message handling.
 */

import type { SimulationState, StepResult } from '@solar-sim/shared';
import {
  type ClientMessage,
  type ServerMessage,
  ClientMessageType,
  ServerMessageType,
  PROTOCOL_VERSION,
  decodePositions,
  decodeMessage,
} from '@solar-sim/shared';

const RECONNECT_DELAY = 2000;
const PING_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

export class NetworkClient {
  private ws: WebSocket | null = null;
  private url = '';
  private playerName = '';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private latency = 0;

  // Callbacks
  onSnapshot: ((snapshot: any) => void) | null = null;
  onPositionUpdate: ((tick: number, positions: Float64Array) => void) | null = null;
  onStepResult: ((result: StepResult) => void) | null = null;
  onConnectionChange: ((connected: boolean) => void) | null = null;

  async connect(url: string, playerName: string): Promise<void> {
    this.url = url;
    this.playerName = playerName;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('Connected to server');
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);

          // Send join message
          this.send({
            type: ClientMessageType.Join,
            playerName: this.playerName,
            protocolVersion: PROTOCOL_VERSION,
          });

          // Start ping loop
          this.startPing();

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from server');
          this.onConnectionChange?.(false);
          this.stopPing();
          this.scheduleReconnect();
        };

        this.ws.onerror = (err) => {
          console.error('WebSocket error');
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    this.ws?.close();
    this.ws = null;
  }

  getLatency(): number {
    return this.latency;
  }

  private handleMessage(event: MessageEvent): void {
    // Binary message = position update
    if (event.data instanceof ArrayBuffer) {
      const { tick, positions } = decodePositions(event.data);
      this.onPositionUpdate?.(tick, positions);
      return;
    }

    // JSON message
    try {
      const msg = decodeMessage<ServerMessage>(event.data);

      switch (msg.type) {
        case ServerMessageType.Snapshot:
          this.onSnapshot?.(msg);
          break;

        case ServerMessageType.StepResult:
          this.onStepResult?.((msg as any).result);
          break;

        case ServerMessageType.Pong:
          this.latency = Date.now() - (msg as any).clientTimestamp;
          break;

        case ServerMessageType.PlayerJoined:
          console.log(`Player joined: ${(msg as any).playerName}`);
          break;

        case ServerMessageType.PlayerLeft:
          console.log(`Player left: ${(msg as any).playerId}`);
          break;

        case ServerMessageType.Event:
          console.log('Sim event:', (msg as any).event);
          break;

        case ServerMessageType.Error:
          console.error('Server error:', (msg as any).message);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('Failed to parse server message:', err);
    }
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      this.send({
        type: ClientMessageType.Ping,
        timestamp: Date.now(),
      });
    }, PING_INTERVAL);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.min(this.reconnectAttempts, 5);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url, this.playerName).catch(() => {
        // Will auto-retry via onclose
      });
    }, delay);
  }
}
