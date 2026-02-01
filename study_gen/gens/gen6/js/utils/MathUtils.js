export class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x; this.y = y; this.z = z;
        return this;
    }

    copy(v) {
        this.x = v.x; this.y = v.y; this.z = v.z;
        return this;
    }

    add(v) {
        this.x += v.x; this.y += v.y; this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x; this.y -= v.y; this.z -= v.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s; this.y *= s; this.z *= s;
        return this;
    }
    
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    lengthSq() {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
}