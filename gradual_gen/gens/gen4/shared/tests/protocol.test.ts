/**
 * Tests for the network protocol encoding/decoding.
 */
import { describe, it, expect } from 'vitest';
import {
  encodePositions,
  decodePositions,
  encodeMessage,
  decodeMessage,
  ClientMessageType,
  ServerMessageType,
  PROTOCOL_VERSION,
} from '../src/protocol.js';

describe('Binary Position Encoding', () => {
  it('should encode and decode positions correctly', () => {
    const tick = 42;
    const positions = new Float64Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0]);

    const buffer = encodePositions(tick, positions);
    const decoded = decodePositions(buffer);

    expect(decoded.tick).toBe(tick);
    expect(decoded.positions.length).toBe(positions.length);
    for (let i = 0; i < positions.length; i++) {
      expect(decoded.positions[i]).toBe(positions[i]);
    }
  });

  it('should handle zero bodies', () => {
    const buffer = encodePositions(0, new Float64Array([]));
    const decoded = decodePositions(buffer);

    expect(decoded.tick).toBe(0);
    expect(decoded.positions.length).toBe(0);
  });

  it('should handle large tick numbers', () => {
    const tick = 4294967295; // Max u32
    const positions = new Float64Array([1e11, 2e11, 3e11]);

    const buffer = encodePositions(tick, positions);
    const decoded = decodePositions(buffer);

    expect(decoded.tick).toBe(tick);
  });

  it('should handle large coordinate values', () => {
    // Solar system scale: AU = 1.496e11 meters
    const positions = new Float64Array([
      1.496e11, 0, 0,     // Earth distance
      7.786e11, 0, 0,     // Jupiter distance
      4.495e12, 0, 0,     // Neptune distance
    ]);

    const buffer = encodePositions(1, positions);
    const decoded = decodePositions(buffer);

    for (let i = 0; i < positions.length; i++) {
      expect(decoded.positions[i]).toBe(positions[i]);
    }
  });

  it('should produce correct buffer size', () => {
    const bodyCount = 9;
    const positions = new Float64Array(bodyCount * 3);
    const buffer = encodePositions(0, positions);

    // Header: 8 bytes (tick u32 + bodyCount u32)
    // Positions: bodyCount * 3 * 8 bytes (f64 each)
    expect(buffer.byteLength).toBe(8 + bodyCount * 3 * 8);
  });
});

describe('JSON Message Encoding', () => {
  it('should encode and decode a join message', () => {
    const msg = {
      type: ClientMessageType.Join as const,
      playerName: 'TestPlayer',
      protocolVersion: PROTOCOL_VERSION,
    };

    const encoded = encodeMessage(msg);
    const decoded = decodeMessage(encoded);

    expect(decoded).toEqual(msg);
  });

  it('should encode and decode a ping message', () => {
    const msg = {
      type: ClientMessageType.Ping as const,
      timestamp: 1234567890,
    };

    const encoded = encodeMessage(msg);
    const decoded = decodeMessage(encoded);

    expect(decoded).toEqual(msg);
  });
});

describe('Protocol Constants', () => {
  it('should have correct protocol version', () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });

  it('should have all required client message types', () => {
    expect(ClientMessageType.Join).toBe('join');
    expect(ClientMessageType.Input).toBe('input');
    expect(ClientMessageType.Ping).toBe('ping');
    expect(ClientMessageType.Leave).toBe('leave');
  });

  it('should have all required server message types', () => {
    expect(ServerMessageType.Snapshot).toBe('snapshot');
    expect(ServerMessageType.Delta).toBe('delta');
    expect(ServerMessageType.Pong).toBe('pong');
    expect(ServerMessageType.Error).toBe('error');
    expect(ServerMessageType.PositionUpdate).toBe('position_update');
  });
});
