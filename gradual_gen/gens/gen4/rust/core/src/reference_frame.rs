///! Reference frame manager with hierarchical SOI/Hill sphere management.
///! Handles smooth frame transitions for dynamics and camera.

use crate::body::{Body, BodyId};
use crate::vector::Vec3;
use crate::units::*;
use serde::{Deserialize, Serialize};

/// Reference frame attached to a celestial body
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceFrame {
    pub center_body_id: BodyId,
    pub origin: Vec3,       // position of frame origin in inertial coords
    pub velocity: Vec3,     // velocity of frame origin
    pub soi_radius: f64,    // meters
    pub hill_radius: f64,   // meters
}

/// SOI transition event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SOITransition {
    pub body_id: BodyId,
    pub from_frame: BodyId,
    pub to_frame: BodyId,
    pub tick: u64,
    pub position_in_new_frame: Vec3,
    pub velocity_in_new_frame: Vec3,
}

/// Hierarchical reference frame manager
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceFrameManager {
    /// Active frames (one per major body that has an SOI)
    pub frames: Vec<ReferenceFrame>,
    /// Which frame each body belongs to (body_id → frame center_body_id)
    pub body_frame_map: Vec<(BodyId, BodyId)>,
    /// History of SOI transitions
    pub transitions: Vec<SOITransition>,
    /// Hysteresis factor for SOI transitions (0-1, how far past SOI boundary to trigger)
    pub hysteresis_factor: f64,
}

impl ReferenceFrameManager {
    pub fn new() -> Self {
        Self {
            frames: Vec::new(),
            body_frame_map: Vec::new(),
            transitions: Vec::new(),
            hysteresis_factor: 0.05, // 5% hysteresis band
        }
    }

    /// Build reference frames from the body hierarchy
    pub fn build_frames(&mut self, bodies: &[Body]) {
        self.frames.clear();

        for body in bodies {
            if body.soi_radius.value() > 0.0 {
                let hill = body.hill_radius(
                    Kilogram::new(SOLAR_MASS), // Approximation: use solar mass
                    body.position.magnitude().max(1.0),
                );

                self.frames.push(ReferenceFrame {
                    center_body_id: body.id,
                    origin: body.position,
                    velocity: body.velocity,
                    soi_radius: body.soi_radius.value(),
                    hill_radius: hill.value(),
                });
            }
        }

        // Sort by SOI radius (smallest first for correct nesting)
        self.frames.sort_by(|a, b| a.soi_radius.partial_cmp(&b.soi_radius).unwrap());
    }

    /// Determine which reference frame a position belongs to
    /// Returns the body_id of the frame center, or None for the root inertial frame
    pub fn find_frame(&self, position: Vec3) -> Option<BodyId> {
        // Find the smallest SOI that contains the position
        let mut best_frame: Option<&ReferenceFrame> = None;
        let mut best_radius = f64::MAX;

        for frame in &self.frames {
            let dist = (position - frame.origin).magnitude();
            if dist < frame.soi_radius && frame.soi_radius < best_radius {
                best_frame = Some(frame);
                best_radius = frame.soi_radius;
            }
        }

        best_frame.map(|f| f.center_body_id)
    }

    /// Check and perform SOI transitions for all bodies
    pub fn check_transitions(
        &mut self,
        bodies: &[Body],
        tick: u64,
    ) -> Vec<SOITransition> {
        let mut new_transitions = Vec::new();

        for body in bodies {
            if body.is_massless || body.soi_radius.value() > 0.0 {
                // Only test particles and minor bodies change frames
            }

            let current_frame = self.body_frame_map.iter()
                .find(|(bid, _)| *bid == body.id)
                .map(|(_, fid)| *fid);

            let new_frame = self.find_frame(body.position);

            if current_frame != new_frame {
                // Check hysteresis: only switch if we're sufficiently inside/outside
                let should_switch = if let Some(new_fid) = new_frame {
                    if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == new_fid) {
                        let dist = (body.position - frame.origin).magnitude();
                        dist < frame.soi_radius * (1.0 - self.hysteresis_factor)
                    } else {
                        true
                    }
                } else if let Some(cur_fid) = current_frame {
                    if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == cur_fid) {
                        let dist = (body.position - frame.origin).magnitude();
                        dist > frame.soi_radius * (1.0 + self.hysteresis_factor)
                    } else {
                        true
                    }
                } else {
                    false
                };

                if should_switch {
                    let transition = SOITransition {
                        body_id: body.id,
                        from_frame: current_frame.unwrap_or(0),
                        to_frame: new_frame.unwrap_or(0),
                        tick,
                        position_in_new_frame: if let Some(fid) = new_frame {
                            if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == fid) {
                                body.position - frame.origin
                            } else {
                                body.position
                            }
                        } else {
                            body.position
                        },
                        velocity_in_new_frame: if let Some(fid) = new_frame {
                            if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == fid) {
                                body.velocity - frame.velocity
                            } else {
                                body.velocity
                            }
                        } else {
                            body.velocity
                        },
                    };

                    new_transitions.push(transition.clone());
                    self.transitions.push(transition);

                    // Update frame map
                    self.body_frame_map.retain(|(bid, _)| *bid != body.id);
                    if let Some(fid) = new_frame {
                        self.body_frame_map.push((body.id, fid));
                    }
                }
            }
        }

        new_transitions
    }

    /// Transform position from inertial to a body-centered frame
    pub fn to_body_frame(&self, position: Vec3, frame_body_id: BodyId) -> Vec3 {
        if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == frame_body_id) {
            position - frame.origin
        } else {
            position
        }
    }

    /// Transform velocity from inertial to a body-centered frame
    pub fn velocity_in_body_frame(&self, velocity: Vec3, frame_body_id: BodyId) -> Vec3 {
        if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == frame_body_id) {
            velocity - frame.velocity
        } else {
            velocity
        }
    }

    /// Transform position from body-centered frame to inertial
    pub fn from_body_frame(&self, position: Vec3, frame_body_id: BodyId) -> Vec3 {
        if let Some(frame) = self.frames.iter().find(|f| f.center_body_id == frame_body_id) {
            position + frame.origin
        } else {
            position
        }
    }

    /// Get smooth interpolation factor for SOI transition visualization
    /// Returns 0 when fully in old frame, 1 when fully in new frame
    pub fn transition_blend_factor(
        &self,
        position: Vec3,
        old_frame: BodyId,
        new_frame: BodyId,
    ) -> f64 {
        if let Some(new_f) = self.frames.iter().find(|f| f.center_body_id == new_frame) {
            let dist = (position - new_f.origin).magnitude();
            let inner = new_f.soi_radius * (1.0 - self.hysteresis_factor * 2.0);
            let outer = new_f.soi_radius;

            if dist <= inner { return 1.0; }
            if dist >= outer { return 0.0; }

            let t = (outer - dist) / (outer - inner);
            // Smooth step for visual continuity
            t * t * (3.0 - 2.0 * t)
        } else {
            1.0
        }
    }

    /// Update frame positions and velocities from current body states
    pub fn update_frames(&mut self, bodies: &[Body]) {
        for frame in &mut self.frames {
            if let Some(body) = bodies.iter().find(|b| b.id == frame.center_body_id) {
                frame.origin = body.position;
                frame.velocity = body.velocity;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;

    #[test]
    fn test_frame_finding() {
        let mut mgr = ReferenceFrameManager::new();
        mgr.frames.push(ReferenceFrame {
            center_body_id: 1,
            origin: Vec3::ZERO,
            velocity: Vec3::ZERO,
            soi_radius: 1e12,
            hill_radius: 1e12,
        });
        mgr.frames.push(ReferenceFrame {
            center_body_id: 2,
            origin: Vec3::new(AU, 0.0, 0.0),
            velocity: Vec3::ZERO,
            soi_radius: 9.29e8,
            hill_radius: 1.5e9,
        });

        // Position near Earth should be in Earth's frame
        let near_earth = Vec3::new(AU + 1e8, 0.0, 0.0);
        assert_eq!(mgr.find_frame(near_earth), Some(2));

        // Position far from everything should find the star
        let far = Vec3::new(5e11, 0.0, 0.0);
        assert_eq!(mgr.find_frame(far), Some(1));
    }

    #[test]
    fn test_frame_transforms() {
        let mut mgr = ReferenceFrameManager::new();
        mgr.frames.push(ReferenceFrame {
            center_body_id: 1,
            origin: Vec3::new(AU, 0.0, 0.0),
            velocity: Vec3::new(0.0, 29784.0, 0.0),
            soi_radius: 9.29e8,
            hill_radius: 1.5e9,
        });

        let inertial_pos = Vec3::new(AU + 1e6, 0.0, 0.0);
        let body_pos = mgr.to_body_frame(inertial_pos, 1);
        assert!((body_pos.x - 1e6).abs() < 1.0);

        let back = mgr.from_body_frame(body_pos, 1);
        assert!((back - inertial_pos).magnitude() < 1.0);
    }
}
