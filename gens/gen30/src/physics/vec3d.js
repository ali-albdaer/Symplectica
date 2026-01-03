export class Vec3d {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() { return new Vec3d(this.x, this.y, this.z); }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }

  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  mul(s) { this.x *= s; this.y *= s; this.z *= s; return this; }

  addScaled(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }

  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  lenSq() { return this.dot(this); }
  len() { return Math.sqrt(this.lenSq()); }

  normalize() {
    const l = this.len();
    if (l > 0) this.mul(1 / l);
    return this;
  }

  static sub(a, b) { return new Vec3d(a.x - b.x, a.y - b.y, a.z - b.z); }
  static add(a, b) { return new Vec3d(a.x + b.x, a.y + b.y, a.z + b.z); }
  static mul(a, s) { return new Vec3d(a.x * s, a.y * s, a.z * s); }

  static cross(a, b) {
    return new Vec3d(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x,
    );
  }
}
