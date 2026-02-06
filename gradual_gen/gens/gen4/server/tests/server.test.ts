/**
 * Server integration tests — verifies server startup, WebSocket handshake,
 * join/ack flow, input processing, and admin commands.
 *
 * Uses a real WebSocket connection on a dynamic port.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import {
  type SimulationState,
  type Body,
  vec3,
  SOLAR_MASS,
  G,
  AU,
  BodyType,
  SolverType,
  IntegratorType,
} from '@solar-sim/shared';
import {
  ClientMessageType,
  ServerMessageType,
  PROTOCOL_VERSION,
} from '@solar-sim/shared';

// Minimal re-implementation of GameServer for testing without wasm dependency
// We test the protocol layer directly via WebSocket messages

const TEST_PORT = 18787 + Math.floor(Math.random() * 1000);

let server: import('../src/server.js').GameServer;
let ws: WebSocket;

function sendJson(socket: WebSocket, msg: any): void {
  socket.send(JSON.stringify(msg));
}

function waitForMessage(socket: WebSocket, predicate?: (msg: any) => boolean, timeoutMs = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for message')), timeoutMs);
    const handler = (data: any) => {
      const raw = data.toString();
      // Skip binary messages
      if (typeof raw !== 'string' || raw.length === 0) return;
      try {
        const msg = JSON.parse(raw);
        if (!predicate || predicate(msg)) {
          clearTimeout(timeout);
          socket.off('message', handler);
          resolve(msg);
        }
      } catch { /* skip binary */ }
    };
    socket.on('message', handler);
  });
}

function waitForMessages(socket: WebSocket, count: number, timeoutMs = 5000): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for messages')), timeoutMs);
    const messages: any[] = [];
    const handler = (data: any) => {
      const raw = data.toString();
      if (typeof raw !== 'string' || raw.length === 0) return;
      try {
        const msg = JSON.parse(raw);
        messages.push(msg);
        if (messages.length >= count) {
          clearTimeout(timeout);
          socket.off('message', handler);
          resolve(messages);
        }
      } catch { /* skip binary */ }
    };
    socket.on('message', handler);
  });
}

function connectClient(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://localhost:${port}`);
    socket.on('open', () => resolve(socket));
    socket.on('error', reject);
  });
}

describe('GameServer', () => {
  beforeAll(async () => {
    const { GameServer } = await import('../src/server.js');
    server = new GameServer({
      port: TEST_PORT,
      tickRate: 10, // slow tick for testing
      preset: 'two_body',
      seed: 42,
    });
    await server.start();
    // Give server a moment to bind
    await new Promise((r) => setTimeout(r, 200));
  });

  afterAll(() => {
    ws?.close();
    server?.stop();
  });

  it('should accept WebSocket connections', async () => {
    ws = await connectClient(TEST_PORT);
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it('should handle join and send snapshot', async () => {
    // Send join
    const snapshotPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.Snapshot);
    sendJson(ws, {
      type: ClientMessageType.Join,
      playerName: 'TestPlayer',
      protocolVersion: PROTOCOL_VERSION,
    });

    const snapshot = await snapshotPromise;
    expect(snapshot.type).toBe(ServerMessageType.Snapshot);
    expect(snapshot.yourPlayerId).toBeGreaterThan(0);
    expect(snapshot.state).toBeDefined();
    expect(snapshot.state.bodies.length).toBeGreaterThan(0);
    expect(snapshot.state.config).toBeDefined();
    expect(snapshot.state.config.solver_type).toBe(SolverType.Direct);
  });

  it('should respond to pings with pongs', async () => {
    const now = Date.now();
    const pongPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.Pong);
    sendJson(ws, {
      type: ClientMessageType.Ping,
      timestamp: now,
    });

    const pong = await pongPromise;
    expect(pong.type).toBe(ServerMessageType.Pong);
    expect(pong.clientTimestamp).toBe(now);
    expect(pong.serverTimestamp).toBeGreaterThan(0);
  });

  it('should acknowledge SpawnBody input and broadcast event', async () => {
    // We'll get both an InputAck and an Event
    const messagesPromise = waitForMessages(ws, 2);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 1,
      tick: 0,
      action: {
        SpawnBody: {
          name: 'TestAsteroid',
          mass: 1e10,
          radius: 1000,
          position: [1e11, 0, 0],
          velocity: [0, 5000, 0],
        },
      },
    });

    const messages = await messagesPromise;
    const ack = messages.find((m: any) => m.type === ServerMessageType.InputAck);
    const event = messages.find((m: any) => m.type === ServerMessageType.Event);

    expect(ack).toBeDefined();
    expect(ack.seq).toBe(1);

    expect(event).toBeDefined();
    expect(event.event.type).toBe('body_added');
    expect(event.event.data.body.name).toBe('TestAsteroid');
  });

  it('should acknowledge DeleteBody input', async () => {
    // Find the body we just added by requesting a snapshot
    const snapshotPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.Snapshot);
    sendJson(ws, { type: ClientMessageType.RequestSnapshot });
    const snapshot = await snapshotPromise;
    const testBody = snapshot.state.bodies.find((b: Body) => b.name === 'TestAsteroid');
    expect(testBody).toBeDefined();

    const messagesPromise = waitForMessages(ws, 2);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 2,
      tick: 0,
      action: {
        DeleteBody: { body_id: testBody.id },
      },
    });

    const messages = await messagesPromise;
    const ack = messages.find((m: any) => m.type === ServerMessageType.InputAck);
    expect(ack).toBeDefined();
    expect(ack.seq).toBe(2);
  });

  it('should reject SpawnBody with invalid params', async () => {
    const errPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.Error);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 3,
      tick: 0,
      action: {
        SpawnBody: {
          name: 'Bad',
          mass: NaN,
          radius: -1,
          position: [0, 0],
          velocity: [0, 0, 0],
        },
      },
    });

    const err = await errPromise;
    expect(err.type).toBe(ServerMessageType.Error);
    expect(err.code).toBe('INVALID_INPUT');
  });

  it('should handle admin status command', async () => {
    const responsePromise = waitForMessage(ws, (m) => m.type === ServerMessageType.AdminResponse);
    sendJson(ws, {
      type: ClientMessageType.AdminCommand,
      command: 'status',
      args: {},
    });

    const response = await responsePromise;
    expect(response.type).toBe(ServerMessageType.AdminResponse);
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.tick).toBeGreaterThanOrEqual(0);
    expect(response.data.bodies).toBeGreaterThan(0);
  });

  it('should handle admin pause/unpause', async () => {
    const pausePromise = waitForMessage(ws, (m) => m.type === ServerMessageType.AdminResponse);
    sendJson(ws, {
      type: ClientMessageType.AdminCommand,
      command: 'pause',
      args: {},
    });
    const pauseResp = await pausePromise;
    expect(pauseResp.success).toBe(true);

    const unpausePromise = waitForMessage(ws, (m) => m.type === ServerMessageType.AdminResponse);
    sendJson(ws, {
      type: ClientMessageType.AdminCommand,
      command: 'unpause',
      args: {},
    });
    const unpauseResp = await unpausePromise;
    expect(unpauseResp.success).toBe(true);
  });

  it('should reject admin commands from non-admin', async () => {
    // Connect a second client
    const ws2 = await connectClient(TEST_PORT);
    const joinPromise = waitForMessage(ws2, (m) => m.type === ServerMessageType.Snapshot);
    sendJson(ws2, {
      type: ClientMessageType.Join,
      playerName: 'NonAdmin',
      protocolVersion: PROTOCOL_VERSION,
    });
    await joinPromise;

    const errPromise = waitForMessage(ws2, (m) => m.type === ServerMessageType.Error);
    sendJson(ws2, {
      type: ClientMessageType.AdminCommand,
      command: 'pause',
      args: {},
    });
    const err = await errPromise;
    expect(err.code).toBe('NOT_ADMIN');

    ws2.close();
  });

  it('should handle SetPaused input', async () => {
    const ackPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.InputAck);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 10,
      tick: 0,
      action: { SetPaused: { paused: true } },
    });

    const ack = await ackPromise;
    expect(ack.seq).toBe(10);

    // Unpause again
    const ack2Promise = waitForMessage(ws, (m) => m.type === ServerMessageType.InputAck);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 11,
      tick: 0,
      action: { SetPaused: { paused: false } },
    });
    await ack2Promise;
  });

  it('should handle SetTimeScale input', async () => {
    const ackPromise = waitForMessage(ws, (m) => m.type === ServerMessageType.InputAck);
    sendJson(ws, {
      type: ClientMessageType.Input,
      seq: 12,
      tick: 0,
      action: { SetTimeScale: { scale: 10 } },
    });

    const ack = await ackPromise;
    expect(ack.seq).toBe(12);
  });

  it('should handle load_preset admin command', async () => {
    const responsePromise = waitForMessage(ws, (m) => m.type === ServerMessageType.AdminResponse);
    sendJson(ws, {
      type: ClientMessageType.AdminCommand,
      command: 'load_preset',
      args: { preset: 'two_body' },
    });

    const response = await responsePromise;
    expect(response.success).toBe(true);
    expect(response.data.bodies).toBeGreaterThan(0);
  });

  it('should handle multiple concurrent clients', async () => {
    const ws2 = await connectClient(TEST_PORT);
    const ws3 = await connectClient(TEST_PORT);

    // Both join
    const p2 = waitForMessage(ws2, (m) => m.type === ServerMessageType.Snapshot);
    const p3 = waitForMessage(ws3, (m) => m.type === ServerMessageType.Snapshot);
    sendJson(ws2, { type: ClientMessageType.Join, playerName: 'P2', protocolVersion: PROTOCOL_VERSION });
    sendJson(ws3, { type: ClientMessageType.Join, playerName: 'P3', protocolVersion: PROTOCOL_VERSION });

    const [snap2, snap3] = await Promise.all([p2, p3]);
    expect(snap2.yourPlayerId).toBeGreaterThan(0);
    expect(snap3.yourPlayerId).toBeGreaterThan(0);
    expect(snap2.yourPlayerId).not.toBe(snap3.yourPlayerId);

    ws2.close();
    ws3.close();
  });
});
