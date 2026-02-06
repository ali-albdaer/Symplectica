///! Type-safe SI units system for the physics engine.
///! All quantities carry their unit type at the Rust type level.
///! Runtime assertions verify conversions; compile-time types prevent misuse.

use serde::{Deserialize, Serialize};
use std::ops::{Add, Sub, Mul, Div, Neg, AddAssign, SubAssign, MulAssign, DivAssign};

/// Macro to generate a strongly-typed scalar quantity wrapper.
macro_rules! unit_type {
    ($name:ident, $unit_str:expr) => {
        #[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
        pub struct $name(pub f64);

        impl $name {
            #[inline]
            pub const fn new(v: f64) -> Self { Self(v) }
            #[inline]
            pub const fn value(self) -> f64 { self.0 }
            #[inline]
            pub fn abs(self) -> Self { Self(self.0.abs()) }
            #[inline]
            pub fn sqrt(self) -> f64 { self.0.sqrt() }
            #[inline]
            pub fn is_finite(self) -> bool { self.0.is_finite() }
            #[inline]
            pub fn max(self, other: Self) -> Self { Self(self.0.max(other.0)) }
            #[inline]
            pub fn min(self, other: Self) -> Self { Self(self.0.min(other.0)) }
            pub fn unit_name() -> &'static str { $unit_str }
        }

        impl Default for $name {
            fn default() -> Self { Self(0.0) }
        }

        impl Add for $name {
            type Output = Self;
            #[inline] fn add(self, rhs: Self) -> Self { Self(self.0 + rhs.0) }
        }
        impl Sub for $name {
            type Output = Self;
            #[inline] fn sub(self, rhs: Self) -> Self { Self(self.0 - rhs.0) }
        }
        impl Neg for $name {
            type Output = Self;
            #[inline] fn neg(self) -> Self { Self(-self.0) }
        }
        impl Mul<f64> for $name {
            type Output = Self;
            #[inline] fn mul(self, rhs: f64) -> Self { Self(self.0 * rhs) }
        }
        impl Mul<$name> for f64 {
            type Output = $name;
            #[inline] fn mul(self, rhs: $name) -> $name { $name(self * rhs.0) }
        }
        impl Div<f64> for $name {
            type Output = Self;
            #[inline] fn div(self, rhs: f64) -> Self { Self(self.0 / rhs) }
        }
        impl Div<$name> for $name {
            type Output = f64;
            #[inline] fn div(self, rhs: $name) -> f64 { self.0 / rhs.0 }
        }
        impl AddAssign for $name {
            #[inline] fn add_assign(&mut self, rhs: Self) { self.0 += rhs.0; }
        }
        impl SubAssign for $name {
            #[inline] fn sub_assign(&mut self, rhs: Self) { self.0 -= rhs.0; }
        }
        impl MulAssign<f64> for $name {
            #[inline] fn mul_assign(&mut self, rhs: f64) { self.0 *= rhs; }
        }
        impl DivAssign<f64> for $name {
            #[inline] fn div_assign(&mut self, rhs: f64) { self.0 /= rhs; }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{} {}", self.0, $unit_str)
            }
        }
    };
}

// ────────── Core SI Units ──────────
unit_type!(Meter, "m");
unit_type!(Kilogram, "kg");
unit_type!(Second, "s");
unit_type!(MeterPerSecond, "m/s");
unit_type!(MeterPerSecondSq, "m/s²");
unit_type!(Newton, "N");
unit_type!(Joule, "J");
unit_type!(Radian, "rad");
unit_type!(RadianPerSecond, "rad/s");
unit_type!(Pascal, "Pa");
unit_type!(KgPerCubicMeter, "kg/m³");
unit_type!(SquareMeter, "m²");
unit_type!(CubicMeter, "m³");
unit_type!(Watt, "W");
unit_type!(WattPerSquareMeter, "W/m²");

// ────────── Physical constants (SI) ──────────

/// Gravitational constant G = 6.67430e-11 m³/(kg·s²)
pub const G: f64 = 6.67430e-11;

/// Speed of light c = 299792458 m/s
pub const C: f64 = 299_792_458.0;

/// Stefan-Boltzmann constant σ = 5.670374419e-8 W/(m²·K⁴)
pub const STEFAN_BOLTZMANN: f64 = 5.670_374_419e-8;

/// Solar luminosity L☉ = 3.828e26 W
pub const SOLAR_LUMINOSITY: f64 = 3.828e26;

/// Solar mass M☉ = 1.989e30 kg
pub const SOLAR_MASS: f64 = 1.989e30;

/// Earth mass = 5.972e24 kg
pub const EARTH_MASS: f64 = 5.972e24;

/// Earth radius = 6.371e6 m
pub const EARTH_RADIUS: f64 = 6.371e6;

/// AU = 1.496e11 m
pub const AU: f64 = 1.496e11;

/// Boltzmann constant k_B = 1.380649e-23 J/K
pub const BOLTZMANN: f64 = 1.380_649e-23;

/// Gas constant R = 8.31446 J/(mol·K)
pub const GAS_CONSTANT: f64 = 8.314_46;

/// PI
pub const PI: f64 = std::f64::consts::PI;
pub const TWO_PI: f64 = 2.0 * PI;

// ────────── Conversion helpers ──────────

/// Convert AU to meters
#[inline]
pub fn au_to_m(au: f64) -> Meter {
    Meter::new(au * AU)
}

/// Convert meters to AU
#[inline]
pub fn m_to_au(m: Meter) -> f64 {
    m.value() / AU
}

/// Convert degrees to radians
#[inline]
pub fn deg_to_rad(deg: f64) -> Radian {
    Radian::new(deg * PI / 180.0)
}

/// Convert radians to degrees
#[inline]
pub fn rad_to_deg(rad: Radian) -> f64 {
    rad.value() * 180.0 / PI
}

/// Convert km/s to m/s
#[inline]
pub fn kms_to_ms(kms: f64) -> MeterPerSecond {
    MeterPerSecond::new(kms * 1000.0)
}

/// Convert hours to seconds
#[inline]
pub fn hours_to_seconds(h: f64) -> Second {
    Second::new(h * 3600.0)
}

/// Convert days to seconds
#[inline]
pub fn days_to_seconds(d: f64) -> Second {
    Second::new(d * 86400.0)
}

/// Convert years to seconds (Julian year = 365.25 days)
#[inline]
pub fn years_to_seconds(y: f64) -> Second {
    Second::new(y * 365.25 * 86400.0)
}

// ────────── Typed arithmetic helpers ──────────

/// distance / time = velocity
#[inline]
pub fn velocity(dist: Meter, time: Second) -> MeterPerSecond {
    MeterPerSecond::new(dist.value() / time.value())
}

/// velocity / time = acceleration
#[inline]
pub fn acceleration(vel: MeterPerSecond, time: Second) -> MeterPerSecondSq {
    MeterPerSecondSq::new(vel.value() / time.value())
}

/// mass * acceleration = force
#[inline]
pub fn force(mass: Kilogram, acc: MeterPerSecondSq) -> Newton {
    Newton::new(mass.value() * acc.value())
}

/// 0.5 * m * v² = kinetic energy
#[inline]
pub fn kinetic_energy(mass: Kilogram, speed: MeterPerSecond) -> Joule {
    Joule::new(0.5 * mass.value() * speed.value() * speed.value())
}

/// -G * m1 * m2 / r = gravitational potential energy
#[inline]
pub fn gravitational_potential_energy(m1: Kilogram, m2: Kilogram, r: Meter) -> Joule {
    debug_assert!(r.value() > 0.0, "Distance must be positive for potential energy");
    Joule::new(-G * m1.value() * m2.value() / r.value())
}

// ────────── Runtime assertions ──────────

/// Assert that a quantity is finite and non-NaN
#[inline]
pub fn assert_finite(label: &str, val: f64) {
    assert!(val.is_finite(), "{} must be finite, got {}", label, val);
}

/// Assert that a quantity is positive
#[inline]
pub fn assert_positive(label: &str, val: f64) {
    assert!(val > 0.0, "{} must be positive, got {}", label, val);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unit_arithmetic() {
        let a = Meter::new(3.0);
        let b = Meter::new(4.0);
        assert_eq!((a + b).value(), 7.0);
        assert_eq!((b - a).value(), 1.0);
        assert_eq!((a * 2.0).value(), 6.0);
        assert_eq!((a / 3.0).value(), 1.0);
        assert_eq!((a / b), 0.75);
    }

    #[test]
    fn test_conversions() {
        let au1 = au_to_m(1.0);
        assert!((au1.value() - AU).abs() < 1.0);

        let rad = deg_to_rad(180.0);
        assert!((rad.value() - PI).abs() < 1e-10);

        let v = kms_to_ms(1.0);
        assert_eq!(v.value(), 1000.0);

        let t = days_to_seconds(1.0);
        assert_eq!(t.value(), 86400.0);
    }

    #[test]
    fn test_energy_formulas() {
        let ke = kinetic_energy(Kilogram::new(2.0), MeterPerSecond::new(3.0));
        assert!((ke.value() - 9.0).abs() < 1e-10);

        let pe = gravitational_potential_energy(
            Kilogram::new(SOLAR_MASS),
            Kilogram::new(EARTH_MASS),
            Meter::new(AU),
        );
        assert!(pe.value() < 0.0); // Bound system
    }

    #[test]
    fn test_display() {
        let m = Meter::new(42.0);
        assert_eq!(format!("{}", m), "42 m");
    }
}
