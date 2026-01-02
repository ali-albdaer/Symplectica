// Placeholder for future math helpers (e.g., Schwarzschild radius, etc.)

export function schwarzschildRadius(mass, gravitationalConstant = 0.2, c = 30.0) {
  // r_s = 2GM / c^2 (scaled units)
  return (2 * gravitationalConstant * mass) / (c * c);
}
