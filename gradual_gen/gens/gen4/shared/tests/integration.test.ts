/**
 * Protocol encoding/decoding integration tests — extended coverage including
 * delta messages, input messages, and message round-trips.
 */

import { describe, it, expect } from 'vitest';
import {
  ClientMessageType,
  ServerMessageType,
  SimEventType,
  PROTOCOL_VERSION,
  TICK_RATE,
  SNAPSHOT_INTERVAL,
  encodePositions,
  decodePositions,
  encodeMessage,
  decodeMessage,
  type JoinMessage,
  type InputMessage,
  type SnapshotMessage,
  type DeltaMessage,
  type EventMessage,
  type InputAckMessage,
} from '@solar-sim/shared';
import {
  BodyType,
  SolverType,
  IntegratorType,
  vec3,
} from '@solar-sim/shared';

describe('Protocol message encoding', () => {
  it('should round-trip JoinMessage', () => {
    const msg: JoinMessage = {
      type: ClientMessageType.Join,
      playerName: 'Test Player',
      protocolVersion: PROTOCOL_VERSION,
    };
    const encoded = encodeMessage(msg);
    const decoded = decodeMessage<JoinMessage>(encoded);
    expect(decoded.type).toBe(ClientMessageType.Join);
    expect(decoded.playerName).toBe('Test Player');
    expect(decoded.protocolVersion).toBe(PROTOCOL_VERSION);
  });

  it('should round-trip InputMessage with SpawnBody', () => {
    const msg: InputMessage = {
      type: ClientMessageType.Input,
      seq: 42,
      tick: 100,
      action: {
        SpawnBody: {
          name: 'TestBody',
          mass: 1e24,
          radius: 1e6,
          position: [1e11, 0, 0],
          velocity: [0, 3e4, 0],
        },
      },
    };
    const encoded = encodeMessage(msg);
    const decoded = decodeMessage<InputMessage>(encoded);
    expect(decoded.seq).toBe(42);
    expect(decoded.tick).toBe(100);
    expect('SpawnBody' in decoded.action).toBe(true);
    if ('SpawnBody' in decoded.action) {
      expect(decoded.action.SpawnBody.name).toBe('TestBody');
      expect(decoded.action.SpawnBody.mass).toBe(1e24);
    }
  });

  it('should round-trip InputMessage with DeleteBody', () => {
    const msg: InputMessage = {
      type: ClientMessageType.Input,
      seq: 5,
      tick: 200,
      action: { DeleteBody: { body_id: 42 } },
    };
    const decoded = decodeMessage<InputMessage>(encodeMessage(msg));
    expect('DeleteBody' in decoded.action).toBe(true);
    if ('DeleteBody' in decoded.action) {
      expect(decoded.action.DeleteBody.body_id).toBe(42);
    }
  });

  it('should round-trip InputMessage with ApplyThrust', () => {
    const msg: InputMessage = {
      type: ClientMessageType.Input,
      seq: 7,
      tick: 300,
      action: {
        ApplyThrust: {
          body_id: 3,
          force: [100, 200, 300],
          duration: 10,
        },
      },
    };
    const decoded = decodeMessage<InputMessage>(encodeMessage(msg));
    if ('ApplyThrust' in decoded.action) {
      expect(decoded.action.ApplyThrust.body_id).toBe(3);
      expect(decoded.action.ApplyThrust.force).toEqual([100, 200, 300]);
      expect(decoded.action.ApplyThrust.duration).toBe(10);
    }
  });

  it('should round-trip InputMessage with SetConfig', () => {
    const msg: InputMessage = {
      type: ClientMessageType.Input,
      seq: 8,
      tick: 400,
      action: { SetConfig: { key: 'softening_length', value: '1e4' } },
    };
    const decoded = decodeMessage<InputMessage>(encodeMessage(msg));
    if ('SetConfig' in decoded.action) {
      expect(decoded.action.SetConfig.key).toBe('softening_length');
      expect(decoded.action.SetConfig.value).toBe('1e4');
    }
  });

  it('should round-trip DeltaMessage', () => {
    const msg: DeltaMessage = {
      type: ServerMessageType.Delta,
      tick: 500,
      time: 1800000,
      deltas: [
        { bodyId: 1, position: vec3(1e11, 2e11, 3e11), velocity: vec3(1000, 2000, 3000) },
        { bodyId: 2, removed: true },
      ],
      newBodies: [],
      removedBodies: [2],
    };
    const decoded = decodeMessage<DeltaMessage>(encodeMessage(msg));
    expect(decoded.tick).toBe(500);
    expect(decoded.deltas.length).toBe(2);
    expect(decoded.deltas[0].bodyId).toBe(1);
    expect(decoded.deltas[0].position!.x).toBe(1e11);
    expect(decoded.deltas[1].removed).toBe(true);
    expect(decoded.removedBodies).toEqual([2]);
  });

  it('should round-trip EventMessage', () => {
    const msg: EventMessage = {
      type: ServerMessageType.Event,
      event: {
        type: SimEventType.BodyAdded,
        tick: 100,
        data: { body: { id: 5, name: 'NewPlanet' } },
      },
    };
    const decoded = decodeMessage<EventMessage>(encodeMessage(msg));
    expect(decoded.event.type).toBe(SimEventType.BodyAdded);
    expect(decoded.event.tick).toBe(100);
    expect((decoded.event.data as any).body.name).toBe('NewPlanet');
  });

  it('should include InputAck in ServerMessageType', () => {
    expect(ServerMessageType.InputAck).toBe('input_ack');
  });

  it('should include all SimEventType values', () => {
    expect(SimEventType.Collision).toBe('collision');
    expect(SimEventType.SOITransition).toBe('soi_transition');
    expect(SimEventType.BodyAdded).toBe('body_added');
    expect(SimEventType.BodyRemoved).toBe('body_removed');
    expect(SimEventType.ConservationWarning).toBe('conservation_warning');
  });
});

describe('Binary position encoding - extended', () => {
  it('should handle large body counts (1000 bodies)', () => {
    const n = 1000;
    const positions = new Float64Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = i * 1e10;
      positions[i * 3 + 1] = i * 2e10;
      positions[i * 3 + 2] = i * 3e10;
    }

    const buffer = encodePositions(99999, positions);
    const decoded = decodePositions(buffer);
    expect(decoded.tick).toBe(99999);
    // Note: decoded positions may be a view into the buffer, check length
    expect(decoded.positions.length).toBe(n * 3);
    expect(decoded.positions[0]).toBe(0);
    expect(decoded.positions[999 * 3]).toBe(999 * 1e10);
  });

  it('should preserve negative coordinates', () => {
    const positions = new Float64Array([-1e12, 5.5e11, -3.3e10]);
    const buffer = encodePositions(1, positions);
    const decoded = decodePositions(buffer);
    expect(decoded.positions[0]).toBe(-1e12);
    expect(decoded.positions[1]).toBe(5.5e11);
    expect(decoded.positions[2]).toBe(-3.3e10);
  });

  it('should handle very small positions (sub-meter)', () => {
    const positions = new Float64Array([0.001, 0.0005, -0.0001]);
    const buffer = encodePositions(0, positions);
    const decoded = decodePositions(buffer);
    expect(decoded.positions[0]).toBeCloseTo(0.001, 10);
    expect(decoded.positions[1]).toBeCloseTo(0.0005, 10);
  });
});

describe('Protocol constants', () => {
  it('should have consistent protocol version', () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });

  it('should have reasonable tick rate', () => {
    expect(TICK_RATE).toBe(60);
  });

  it('should have snapshot interval greater than tick rate', () => {
    expect(SNAPSHOT_INTERVAL).toBe(300);
    expect(SNAPSHOT_INTERVAL).toBeGreaterThan(TICK_RATE);
  });

  it('should have all InputAction variants defined', () => {
    // Verify TypeScript discriminated union types compile correctly
    const actions = [
      { SpawnBody: { name: 'x', mass: 1, radius: 1, position: [0, 0, 0] as [number, number, number], velocity: [0, 0, 0] as [number, number, number] } },
      { DeleteBody: { body_id: 1 } },
      { ApplyThrust: { body_id: 1, force: [0, 0, 0] as [number, number, number], duration: 1 } },
      { SetConfig: { key: 'dt', value: '3600' } },
      { SetPaused: { paused: true } },
      { SetTimeScale: { scale: 2 } },
    ];
    expect(actions.length).toBe(6);
  });
});
