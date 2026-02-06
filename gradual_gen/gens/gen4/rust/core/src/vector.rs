///! 3D vector type for physics calculations, maintaining f64 precision throughout.
///! Used for positions, velocities, accelerations, and forces.

use serde::{Deserialize, Serialize};
use std::ops::{Add, Sub, Mul, Div, Neg, AddAssign, SubAssign, MulAssign};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vec3 {
    pub const ZERO: Vec3 = Vec3 { x: 0.0, y: 0.0, z: 0.0 };
    pub const X: Vec3 = Vec3 { x: 1.0, y: 0.0, z: 0.0 };
    pub const Y: Vec3 = Vec3 { x: 0.0, y: 1.0, z: 0.0 };
    pub const Z: Vec3 = Vec3 { x: 0.0, y: 0.0, z: 1.0 };

    #[inline]
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    #[inline]
    pub fn magnitude_squared(self) -> f64 {
        self.x * self.x + self.y * self.y + self.z * self.z
    }

    #[inline]
    pub fn magnitude(self) -> f64 {
        self.magnitude_squared().sqrt()
    }

    #[inline]
    pub fn normalized(self) -> Self {
        let m = self.magnitude();
        if m < 1e-300 {
            Self::ZERO
        } else {
            self / m
        }
    }

    #[inline]
    pub fn dot(self, rhs: Self) -> f64 {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
    }

    #[inline]
    pub fn cross(self, rhs: Self) -> Self {
        Self {
            x: self.y * rhs.z - self.z * rhs.y,
            y: self.z * rhs.x - self.x * rhs.z,
            z: self.x * rhs.y - self.y * rhs.x,
        }
    }

    #[inline]
    pub fn distance_to(self, other: Self) -> f64 {
        (self - other).magnitude()
    }

    #[inline]
    pub fn distance_squared_to(self, other: Self) -> f64 {
        (self - other).magnitude_squared()
    }

    /// Linear interpolation between two vectors
    #[inline]
    pub fn lerp(self, other: Self, t: f64) -> Self {
        self + (other - self) * t
    }

    /// Component-wise absolute value
    #[inline]
    pub fn abs(self) -> Self {
        Self {
            x: self.x.abs(),
            y: self.y.abs(),
            z: self.z.abs(),
        }
    }

    /// Component-wise minimum
    #[inline]
    pub fn min(self, other: Self) -> Self {
        Self {
            x: self.x.min(other.x),
            y: self.y.min(other.y),
            z: self.z.min(other.z),
        }
    }

    /// Component-wise maximum
    #[inline]
    pub fn max(self, other: Self) -> Self {
        Self {
            x: self.x.max(other.x),
            y: self.y.max(other.y),
            z: self.z.max(other.z),
        }
    }

    /// Check if all components are finite
    #[inline]
    pub fn is_finite(self) -> bool {
        self.x.is_finite() && self.y.is_finite() && self.z.is_finite()
    }

    /// Project this vector onto another
    #[inline]
    pub fn project_onto(self, other: Self) -> Self {
        let d = other.dot(other);
        if d < 1e-300 {
            Self::ZERO
        } else {
            other * (self.dot(other) / d)
        }
    }

    /// Reject this vector from another (component perpendicular to other)
    #[inline]
    pub fn reject_from(self, other: Self) -> Self {
        self - self.project_onto(other)
    }

    /// Convert to [f32; 3] for GPU upload (camera-relative)
    #[inline]
    pub fn to_f32_array(self) -> [f32; 3] {
        [self.x as f32, self.y as f32, self.z as f32]
    }

    /// Camera-relative offset for dual-precision rendering
    #[inline]
    pub fn camera_relative(self, camera_pos: Vec3) -> [f32; 3] {
        let rel = self - camera_pos;
        [rel.x as f32, rel.y as f32, rel.z as f32]
    }
}

impl Default for Vec3 {
    fn default() -> Self {
        Self::ZERO
    }
}

impl Add for Vec3 {
    type Output = Self;
    #[inline]
    fn add(self, rhs: Self) -> Self {
        Self::new(self.x + rhs.x, self.y + rhs.y, self.z + rhs.z)
    }
}

impl Sub for Vec3 {
    type Output = Self;
    #[inline]
    fn sub(self, rhs: Self) -> Self {
        Self::new(self.x - rhs.x, self.y - rhs.y, self.z - rhs.z)
    }
}

impl Neg for Vec3 {
    type Output = Self;
    #[inline]
    fn neg(self) -> Self {
        Self::new(-self.x, -self.y, -self.z)
    }
}

impl Mul<f64> for Vec3 {
    type Output = Self;
    #[inline]
    fn mul(self, s: f64) -> Self {
        Self::new(self.x * s, self.y * s, self.z * s)
    }
}

impl Mul<Vec3> for f64 {
    type Output = Vec3;
    #[inline]
    fn mul(self, v: Vec3) -> Vec3 {
        Vec3::new(self * v.x, self * v.y, self * v.z)
    }
}

impl Div<f64> for Vec3 {
    type Output = Self;
    #[inline]
    fn div(self, s: f64) -> Self {
        let inv = 1.0 / s;
        Self::new(self.x * inv, self.y * inv, self.z * inv)
    }
}

impl AddAssign for Vec3 {
    #[inline]
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x; self.y += rhs.y; self.z += rhs.z;
    }
}

impl SubAssign for Vec3 {
    #[inline]
    fn sub_assign(&mut self, rhs: Self) {
        self.x -= rhs.x; self.y -= rhs.y; self.z -= rhs.z;
    }
}

impl MulAssign<f64> for Vec3 {
    #[inline]
    fn mul_assign(&mut self, s: f64) {
        self.x *= s; self.y *= s; self.z *= s;
    }
}

impl std::fmt::Display for Vec3 {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({:.6e}, {:.6e}, {:.6e})", self.x, self.y, self.z)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_ops() {
        let a = Vec3::new(1.0, 2.0, 3.0);
        let b = Vec3::new(4.0, 5.0, 6.0);
        let sum = a + b;
        assert_eq!(sum, Vec3::new(5.0, 7.0, 9.0));

        let diff = b - a;
        assert_eq!(diff, Vec3::new(3.0, 3.0, 3.0));
    }

    #[test]
    fn test_dot_cross() {
        let a = Vec3::new(1.0, 0.0, 0.0);
        let b = Vec3::new(0.0, 1.0, 0.0);
        assert_eq!(a.dot(b), 0.0);
        assert_eq!(a.cross(b), Vec3::new(0.0, 0.0, 1.0));
    }

    #[test]
    fn test_magnitude() {
        let v = Vec3::new(3.0, 4.0, 0.0);
        assert!((v.magnitude() - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_normalize() {
        let v = Vec3::new(3.0, 4.0, 0.0);
        let n = v.normalized();
        assert!((n.magnitude() - 1.0).abs() < 1e-10);
        assert!((n.x - 0.6).abs() < 1e-10);
        assert!((n.y - 0.8).abs() < 1e-10);
    }

    #[test]
    fn test_camera_relative() {
        let world = Vec3::new(1e15, 2e15, 3e15);
        let cam = Vec3::new(1e15, 2e15, 3e15);
        let rel = world.camera_relative(cam);
        assert!(rel[0].abs() < 1e-3);
        assert!(rel[1].abs() < 1e-3);
        assert!(rel[2].abs() < 1e-3);
    }

    #[test]
    fn test_lerp() {
        let a = Vec3::new(0.0, 0.0, 0.0);
        let b = Vec3::new(10.0, 20.0, 30.0);
        let mid = a.lerp(b, 0.5);
        assert_eq!(mid, Vec3::new(5.0, 10.0, 15.0));
    }
}
