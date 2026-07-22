// ── Sphere LOD — Named Body (planets, stars, moons) ──────────────────────
// Segment counts for each LOD tier. Width × Height → ~triangles
// Ultra:     384 × 192 → ~73K tris  (was 512×256 = 261K, capped for perf)
// NearUltra: 256 × 128 → ~32K tris  (new intermediate tier)
// Medium:    128 × 64  → ~16K tris  (unchanged)
// Base:      set by sphereSegments (driven by visual preset via lodBias)

export const LOD_ULTRA_SEGMENTS      = { w: 384, h: 192 } as const;
export const LOD_NEAR_ULTRA_SEGMENTS = { w: 256, h: 128 } as const;
export const LOD_MEDIUM_SEGMENTS     = { w: 128, h:  64 } as const;

// ── Sphere LOD — Distance Multipliers (relative to visual body radius) ───
// A body enters a tier when: distanceToCamera < radius * MULTIPLIER
// Hysteresis: switch up at (MULTIPLIER), switch down at (MULTIPLIER * HYSTERESIS_FACTOR)
export const LOD_ULTRA_DIST_MULT      = 20;   // d < r×20  → Ultra
export const LOD_NEAR_ULTRA_DIST_MULT = 50;   // d < r×50  → NearUltra
export const LOD_MEDIUM_DIST_MULT     = 100;  // d < r×100 → Medium
export const LOD_HYSTERESIS_FACTOR    = 1.10; // 10% band to prevent jitter on exit

// ── Base Sphere Segments (default/fallback before preset applies) ─────────
export const LOD_BASE_SEGMENTS_W = 64;
export const LOD_BASE_SEGMENTS_H = 32;

// ── Instanced / Generic Body LOD (IcosahedronGeometry detail levels) ──────
// detail=1 →  80 triangles (distant swarm, e.g. asteroid belt at > threshold)
// detail=2 → 320 triangles (closer instanced body, current default)
// Hero mesh is a SphereGeometry promoted for bodies entering very close range.
export const LOD_INSTANCED_DETAIL_CLOSE  = 2;     // IcosahedronGeometry detail close
export const LOD_INSTANCED_DETAIL_FAR    = 1;     // IcosahedronGeometry detail far
export const LOD_INSTANCED_CLOSE_DIST_MULT = 200; // d < r×200 → use detail=2, else detail=1
export const LOD_INSTANCED_HERO_DIST_MULT  = 20;  // d < r×20  → promote to hero mesh

// ── Hero Mesh Segments (SphereGeometry for instanced bodies close up) ────
export const LOD_HERO_SEGMENTS_W = 128;
export const LOD_HERO_SEGMENTS_H = 64;
