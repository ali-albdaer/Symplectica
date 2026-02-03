/**
 * Error Handling Utilities
 * 
 * Provides structured error types for physics and simulation errors.
 * All errors are descriptive and include context for debugging.
 * 
 * @module errors
 */

import type { BodyId, PhysicsError, PhysicsErrorType } from './types.js';

/**
 * Create a structured physics error
 */
export function createPhysicsError(
  type: PhysicsErrorType,
  message: string,
  details: PhysicsError['details'] = {},
  recoverable = true
): PhysicsError {
  return {
    type,
    message,
    details,
    timestamp: Date.now(),
    recoverable
  };
}

/**
 * Custom error class for physics errors
 */
export class SimulationError extends Error {
  public readonly physicsError: PhysicsError;

  constructor(error: PhysicsError) {
    super(`[${error.type}] ${error.message}`);
    this.name = 'SimulationError';
    this.physicsError = error;
  }

  /**
   * Create a singularity error (bodies too close)
   */
  static singularity(bodyId1: BodyId, bodyId2: BodyId, distance: number): SimulationError {
    return new SimulationError(createPhysicsError(
      'singularity',
      `Gravitational singularity: bodies ${bodyId1} and ${bodyId2} are ${distance.toExponential(3)}m apart (below softening threshold)`,
      { bodyIds: [bodyId1, bodyId2], values: [distance] },
      true
    ));
  }

  /**
   * Create a numerical overflow error
   */
  static overflow(context: string, value: number): SimulationError {
    return new SimulationError(createPhysicsError(
      'numerical-overflow',
      `Numerical overflow in ${context}: value ${value.toExponential(3)} exceeds Float64 range`,
      { values: [value] },
      false
    ));
  }

  /**
   * Create an energy divergence error
   */
  static energyDivergence(
    initialEnergy: number,
    currentEnergy: number,
    relativeError: number
  ): SimulationError {
    return new SimulationError(createPhysicsError(
      'energy-divergence',
      `Energy conservation violated: relative error ${(relativeError * 100).toFixed(4)}% ` +
      `(initial: ${initialEnergy.toExponential(3)}, current: ${currentEnergy.toExponential(3)})`,
      { values: [initialEnergy, currentEnergy, relativeError] },
      true
    ));
  }

  /**
   * Create a NaN detection error
   */
  static nanDetected(context: string, bodyId?: BodyId): SimulationError {
    return new SimulationError(createPhysicsError(
      'nan-detected',
      `NaN detected in ${context}${bodyId ? ` for body ${bodyId}` : ''}`,
      { bodyIds: bodyId ? [bodyId] : [] },
      false
    ));
  }

  /**
   * Create a body limit exceeded error
   */
  static bodyLimitExceeded(current: number, max: number, bodyType: string): SimulationError {
    return new SimulationError(createPhysicsError(
      'body-limit-exceeded',
      `${bodyType} body limit exceeded: ${current} > ${max}`,
      { values: [current, max] },
      true
    ));
  }

  /**
   * Create an invalid state error
   */
  static invalidState(context: string, details: string): SimulationError {
    return new SimulationError(createPhysicsError(
      'invalid-state',
      `Invalid state in ${context}: ${details}`,
      {},
      false
    ));
  }
}

/**
 * Validate that a number is finite and not NaN
 */
export function validateNumber(value: number, name: string): void {
  if (Number.isNaN(value)) {
    throw SimulationError.nanDetected(name);
  }
  if (!Number.isFinite(value)) {
    throw SimulationError.overflow(name, value);
  }
}

/**
 * Safe division that throws descriptive errors
 */
export function safeDivide(numerator: number, denominator: number, context: string): number {
  if (denominator === 0) {
    throw new Error(`Division by zero in ${context}: ${numerator} / 0`);
  }
  const result = numerator / denominator;
  if (!Number.isFinite(result)) {
    throw SimulationError.overflow(context, result);
  }
  return result;
}

/**
 * Safe square root that handles negative inputs
 */
export function safeSqrt(value: number, context: string): number {
  if (value < 0) {
    throw new Error(`Square root of negative number in ${context}: sqrt(${value})`);
  }
  return Math.sqrt(value);
}

/**
 * Assert a condition, throw if false
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert value is not null or undefined
 */
export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${name} to be defined, got ${value}`);
  }
}
