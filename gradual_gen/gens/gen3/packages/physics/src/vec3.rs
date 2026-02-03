//! 3D Vector mathematics with Float64 precision
//!
//! All operations use SI units (meters for positions, m/s for velocities, etc.)

use serde::{Deserialize, Serialize};
use std::ops::{Add, AddAssign, Div, DivAssign, Mul, MulAssign, Neg, Sub, SubAssign};

/// A 3D vector with Float64 components
#[derive(Debug, Clone, Copy, PartialEq, Default, Serialize, Deserialize)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vec3 {
    /// Create a new vector
    #[inline]
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    /// Zero vector
    #[inline]
    pub const fn zero() -> Self {
        Self::new(0.0, 0.0, 0.0)
    }

    /// Unit vector along X axis
    #[inline]
    pub const fn unit_x() -> Self {
        Self::new(1.0, 0.0, 0.0)
    }

    /// Unit vector along Y axis
    #[inline]
    pub const fn unit_y() -> Self {
        Self::new(0.0, 1.0, 0.0)
    }

    /// Unit vector along Z axis
    #[inline]
    pub const fn unit_z() -> Self {
        Self::new(0.0, 0.0, 1.0)
    }

    /// Create from an array
    #[inline]
    pub const fn from_array(arr: [f64; 3]) -> Self {
        Self::new(arr[0], arr[1], arr[2])
    }

    /// Convert to array
    #[inline]
    pub const fn to_array(self) -> [f64; 3] {
        [self.x, self.y, self.z]
    }

    /// Squared magnitude (avoids sqrt)
    #[inline]
    pub fn magnitude_squared(self) -> f64 {
        self.x * self.x + self.y * self.y + self.z * self.z
    }

    /// Magnitude (length) of the vector
    #[inline]
    pub fn magnitude(self) -> f64 {
        self.magnitude_squared().sqrt()
    }

    /// Normalize the vector (returns unit vector)
    /// Returns zero vector if magnitude is zero
    #[inline]
    pub fn normalize(self) -> Self {
        let mag = self.magnitude();
        if mag > f64::EPSILON {
            self / mag
        } else {
            Self::zero()
        }
    }

    /// Dot product
    #[inline]
    pub fn dot(self, other: Self) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    /// Cross product
    #[inline]
    pub fn cross(self, other: Self) -> Self {
        Self::new(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )
    }

    /// Distance to another vector
    #[inline]
    pub fn distance(self, other: Self) -> f64 {
        (self - other).magnitude()
    }

    /// Squared distance to another vector (avoids sqrt)
    #[inline]
    pub fn distance_squared(self, other: Self) -> f64 {
        (self - other).magnitude_squared()
    }

    /// Linear interpolation between two vectors
    #[inline]
    pub fn lerp(self, other: Self, t: f64) -> Self {
        self + (other - self) * t
    }

    /// Check if any component is NaN
    #[inline]
    pub fn is_nan(self) -> bool {
        self.x.is_nan() || self.y.is_nan() || self.z.is_nan()
    }

    /// Check if any component is infinite
    #[inline]
    pub fn is_infinite(self) -> bool {
        self.x.is_infinite() || self.y.is_infinite() || self.z.is_infinite()
    }

    /// Check if vector is finite (no NaN or infinity)
    #[inline]
    pub fn is_finite(self) -> bool {
        self.x.is_finite() && self.y.is_finite() && self.z.is_finite()
    }

    /// Clamp magnitude to a maximum value
    #[inline]
    pub fn clamp_magnitude(self, max_magnitude: f64) -> Self {
        let mag_sq = self.magnitude_squared();
        if mag_sq > max_magnitude * max_magnitude {
            self.normalize() * max_magnitude
        } else {
            self
        }
    }

    /// Component-wise minimum
    #[inline]
    pub fn min(self, other: Self) -> Self {
        Self::new(
            self.x.min(other.x),
            self.y.min(other.y),
            self.z.min(other.z),
        )
    }

    /// Component-wise maximum
    #[inline]
    pub fn max(self, other: Self) -> Self {
        Self::new(
            self.x.max(other.x),
            self.y.max(other.y),
            self.z.max(other.z),
        )
    }

    /// Component-wise absolute value
    #[inline]
    pub fn abs(self) -> Self {
        Self::new(self.x.abs(), self.y.abs(), self.z.abs())
    }
}

// Operator implementations

impl Add for Vec3 {
    type Output = Self;

    #[inline]
    fn add(self, other: Self) -> Self {
        Self::new(self.x + other.x, self.y + other.y, self.z + other.z)
    }
}

impl AddAssign for Vec3 {
    #[inline]
    fn add_assign(&mut self, other: Self) {
        self.x += other.x;
        self.y += other.y;
        self.z += other.z;
    }
}

impl Sub for Vec3 {
    type Output = Self;

    #[inline]
    fn sub(self, other: Self) -> Self {
        Self::new(self.x - other.x, self.y - other.y, self.z - other.z)
    }
}

impl SubAssign for Vec3 {
    #[inline]
    fn sub_assign(&mut self, other: Self) {
        self.x -= other.x;
        self.y -= other.y;
        self.z -= other.z;
    }
}

impl Mul<f64> for Vec3 {
    type Output = Self;

    #[inline]
    fn mul(self, scalar: f64) -> Self {
        Self::new(self.x * scalar, self.y * scalar, self.z * scalar)
    }
}

impl Mul<Vec3> for f64 {
    type Output = Vec3;

    #[inline]
    fn mul(self, vec: Vec3) -> Vec3 {
        Vec3::new(self * vec.x, self * vec.y, self * vec.z)
    }
}

impl MulAssign<f64> for Vec3 {
    #[inline]
    fn mul_assign(&mut self, scalar: f64) {
        self.x *= scalar;
        self.y *= scalar;
        self.z *= scalar;
    }
}

impl Div<f64> for Vec3 {
    type Output = Self;

    #[inline]
    fn div(self, scalar: f64) -> Self {
        Self::new(self.x / scalar, self.y / scalar, self.z / scalar)
    }
}

impl DivAssign<f64> for Vec3 {
    #[inline]
    fn div_assign(&mut self, scalar: f64) {
        self.x /= scalar;
        self.y /= scalar;
        self.z /= scalar;
    }
}

impl Neg for Vec3 {
    type Output = Self;

    #[inline]
    fn neg(self) -> Self {
        Self::new(-self.x, -self.y, -self.z)
    }
}

impl From<[f64; 3]> for Vec3 {
    #[inline]
    fn from(arr: [f64; 3]) -> Self {
        Self::from_array(arr)
    }
}

impl From<Vec3> for [f64; 3] {
    #[inline]
    fn from(vec: Vec3) -> Self {
        vec.to_array()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const EPSILON: f64 = 1e-10;

    fn approx_eq(a: f64, b: f64) -> bool {
        (a - b).abs() < EPSILON
    }

    fn vec_approx_eq(a: Vec3, b: Vec3) -> bool {
        approx_eq(a.x, b.x) && approx_eq(a.y, b.y) && approx_eq(a.z, b.z)
    }

    #[test]
    fn test_creation() {
        let v = Vec3::new(1.0, 2.0, 3.0);
        assert_eq!(v.x, 1.0);
        assert_eq!(v.y, 2.0);
        assert_eq!(v.z, 3.0);
    }

    #[test]
    fn test_magnitude() {
        let v = Vec3::new(3.0, 4.0, 0.0);
        assert!(approx_eq(v.magnitude(), 5.0));
    }

    #[test]
    fn test_normalize() {
        let v = Vec3::new(3.0, 4.0, 0.0);
        let n = v.normalize();
        assert!(approx_eq(n.magnitude(), 1.0));
        assert!(approx_eq(n.x, 0.6));
        assert!(approx_eq(n.y, 0.8));
    }

    #[test]
    fn test_dot_product() {
        let a = Vec3::new(1.0, 2.0, 3.0);
        let b = Vec3::new(4.0, 5.0, 6.0);
        assert!(approx_eq(a.dot(b), 32.0));
    }

    #[test]
    fn test_cross_product() {
        let a = Vec3::unit_x();
        let b = Vec3::unit_y();
        let c = a.cross(b);
        assert!(vec_approx_eq(c, Vec3::unit_z()));
    }

    #[test]
    fn test_operations() {
        let a = Vec3::new(1.0, 2.0, 3.0);
        let b = Vec3::new(4.0, 5.0, 6.0);

        let sum = a + b;
        assert!(vec_approx_eq(sum, Vec3::new(5.0, 7.0, 9.0)));

        let diff = b - a;
        assert!(vec_approx_eq(diff, Vec3::new(3.0, 3.0, 3.0)));

        let scaled = a * 2.0;
        assert!(vec_approx_eq(scaled, Vec3::new(2.0, 4.0, 6.0)));
    }
}
