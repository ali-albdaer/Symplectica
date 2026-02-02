/**
 * Physics Validation Utilities
 * Ensures no silent failures with NaN/Infinity values.
 * @module shared/physics/validation
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - List of error messages
 */

/**
 * Validate that a value is a finite positive number
 * @param {number} value 
 * @param {string} name 
 * @returns {ValidationResult}
 */
export function validatePositive(value, name) {
  const errors = [];
  
  if (typeof value !== 'number') {
    errors.push(`${name} must be a number, got ${typeof value}`);
  } else if (!Number.isFinite(value)) {
    errors.push(`${name} must be finite, got ${value}`);
  } else if (value <= 0) {
    errors.push(`${name} must be positive, got ${value}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate that a value is a finite non-negative number
 * @param {number} value 
 * @param {string} name 
 * @returns {ValidationResult}
 */
export function validateNonNegative(value, name) {
  const errors = [];
  
  if (typeof value !== 'number') {
    errors.push(`${name} must be a number, got ${typeof value}`);
  } else if (!Number.isFinite(value)) {
    errors.push(`${name} must be finite, got ${value}`);
  } else if (value < 0) {
    errors.push(`${name} must be non-negative, got ${value}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate that a value is a finite number
 * @param {number} value 
 * @param {string} name 
 * @returns {ValidationResult}
 */
export function validateFinite(value, name) {
  const errors = [];
  
  if (typeof value !== 'number') {
    errors.push(`${name} must be a number, got ${typeof value}`);
  } else if (!Number.isFinite(value)) {
    errors.push(`${name} must be finite, got ${value}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a Vector3D object
 * @param {import('../math/Vector3D.js').Vector3D} vec 
 * @param {string} name 
 * @returns {ValidationResult}
 */
export function validateVector(vec, name) {
  const errors = [];
  
  if (!vec) {
    errors.push(`${name} is null or undefined`);
    return { valid: false, errors };
  }
  
  if (typeof vec.x !== 'number' || !Number.isFinite(vec.x)) {
    errors.push(`${name}.x is invalid: ${vec.x}`);
  }
  if (typeof vec.y !== 'number' || !Number.isFinite(vec.y)) {
    errors.push(`${name}.y is invalid: ${vec.y}`);
  }
  if (typeof vec.z !== 'number' || !Number.isFinite(vec.z)) {
    errors.push(`${name}.z is invalid: ${vec.z}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a celestial body's physical parameters
 * @param {Object} body 
 * @returns {ValidationResult}
 */
export function validateBody(body) {
  const errors = [];
  
  if (!body) {
    return { valid: false, errors: ['Body is null or undefined'] };
  }
  
  if (!body.id) {
    errors.push('Body must have an id');
  }
  
  const massResult = validatePositive(body.mass, 'mass');
  errors.push(...massResult.errors);
  
  const radiusResult = validatePositive(body.radius, 'radius');
  errors.push(...radiusResult.errors);
  
  const posResult = validateVector(body.position, 'position');
  errors.push(...posResult.errors);
  
  const velResult = validateVector(body.velocity, 'velocity');
  errors.push(...velResult.errors);
  
  return { valid: errors.length === 0, errors };
}

/**
 * Assert that a physics state is valid, throw if not
 * @param {Object} state - Physics state to validate
 * @param {string} context - Context for error messages
 * @throws {Error} If state is invalid
 */
export function assertValidState(state, context = 'Physics') {
  if (!state || !state.bodies) {
    throw new Error(`[${context}] Invalid state: missing bodies array`);
  }
  
  for (const body of state.bodies) {
    const result = validateBody(body);
    if (!result.valid) {
      throw new Error(`[${context}] Invalid body '${body?.id || 'unknown'}': ${result.errors.join(', ')}`);
    }
  }
  
  if (!Number.isFinite(state.time)) {
    throw new Error(`[${context}] Invalid simulation time: ${state.time}`);
  }
}

/**
 * Clamp a value to a range with validation
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @param {string} name 
 * @returns {number}
 */
export function clampValidated(value, min, max, name) {
  if (!Number.isFinite(value)) {
    console.warn(`[Validation] ${name} was ${value}, clamping to ${min}`);
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

export default {
  validatePositive,
  validateNonNegative,
  validateFinite,
  validateVector,
  validateBody,
  assertValidState,
  clampValidated
};
