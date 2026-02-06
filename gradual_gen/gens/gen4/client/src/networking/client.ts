/**
 * WebSocket network client with auto-reconnect, ping/pong, message handling,
 * and client-side prediction / server reconciliation support.
 */

import type { SimulationState, StepResult, InputAction } from '@solar-sim/shared';
import {
  type ClientMessage,
  type ServerMessage,
  type InputMessage,
  ClientMessageType,
  ServerMessageType,
  PROTOCOL_VERSION,
  decodePositions,
  decodeMessage,
} from '@solar-sim/shared';

const RECONNECT_DELAY = 2000;
const PING_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_PREDICTION_BUFFER = 300;

/** Stored input for prediction reconciliation */
export interface PendingInput {
  seq: number;
  tick: number;
  action: InputAction;
  timestamp: number;
}

export class NetworkClient {
  private ws: WebSocket | null = null;
  private url = '';
  private playerName = '';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private latency = 0;

  // Client prediction state
  private inputSeq = 0;
  private pendingInputs: PendingInput[] = [];
  private lastAckedSeq = 0;
  private serverTick = 0;

  // Callbacks
  onSnapshot: ((snapshot: any) => void) | null = null;
  onPositionUpdate: ((tick: number, positions: Float64Array) => void) | null = null;
  onStepResult: ((result: StepResult) => void) | null = null;
  onConnectionChange: ((connected: boolean) => void) | null = null;
  /** Called after reconciliation with unacked inputs to replay */
  onReconcile: ((serverState: SimulationState, pendingInputs: PendingInput[]) => void) | null = null;
  /** Called on delta updates */
  onDelta: ((delta: any) => void) | null = null;
  /** Called on simulation events (collision, body added, etc.) */
  onEvent: ((event: any) => void) | null = null;
  /** Called on server errors */
  onError: ((code: string, message: string) => void) | null = null;

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

  /**
   * Send a player input with sequence tracking for prediction/reconciliation.
   * The input is buffered locally so it can be replayed after server correction.
   */
  sendInput(action: InputAction, clientTick: number): number {
    const seq = ++this.inputSeq;
    const pending: PendingInput = {
      seq,
      tick: clientTick,
      action,
      timestamp: Date.now(),
    };

    this.pendingInputs.push(pending);

    // Trim old inputs to prevent unbounded growth
    if (this.pendingInputs.length > MAX_PREDICTION_BUFFER) {
      this.pendingInputs = this.pendingInputs.slice(-MAX_PREDICTION_BUFFER);
    }

    // Send to server
    this.send({
      type: ClientMessageType.Input,
      seq,
      tick: clientTick,
      action,
    });

    return seq;
  }

  /** Get current latency */
  getLatency(): number {
    return this.latency;
  }

  /** Get the last acknowledged server tick */
  getServerTick(): number {
    return this.serverTick;
  }

  /** Get count of unacknowledged inputs */
  getPendingInputCount(): number {
    return this.pendingInputs.length;
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

  /** Check if connected */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
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
        case ServerMessageType.Snapshot: {
          const snapshot = msg as any;
          this.serverTick = snapshot.serverTick || 0;

          // Discard pending inputs that the server has already processed
          this.pendingInputs = this.pendingInputs.filter(
            (input) => input.tick > this.serverTick
          );

          // Notify for reconciliation: app should reset to server state
          // and replay pending inputs
          if (this.onReconcile && this.pendingInputs.length > 0) {
            this.onReconcile(snapshot.state, [...this.pendingInputs]);
          }

          this.onSnapshot?.(snapshot);
          break;
        }

        case ServerMessageType.Delta:
          this.onDelta?.(msg);
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
          this.onEvent?.((msg as any).event);
          break;

        case ServerMessageType.InputAck: {
          const ack = msg as any;
          this.lastAckedSeq = Math.max(this.lastAckedSeq, ack.seq);
          // Remove acknowledged inputs
          this.pendingInputs = this.pendingInputs.filter(
            (input) => input.seq > ack.seq
          );
          break;
        }

        case ServerMessageType.Error:
          console.error('Server error:', (msg as any).message);
          this.onError?.((msg as any).code, (msg as any).message);
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
