/**
 * Time and Date Utilities
 * 
 * Functions for converting between different time systems:
 * - Unix timestamps (milliseconds since 1970-01-01)
 * - Julian Date (days since 4713 BC January 1, 12:00 UT)
 * - J2000 (seconds since 2000-01-01 12:00:00 TT)
 * 
 * Note: These conversions assume TT ≈ UTC for simplicity.
 * For high-precision applications, leap seconds should be considered.
 * 
 * @module time
 */

import { J2000_JD, SECONDS_PER_DAY, JULIAN_YEAR } from './constants.js';

// ============================================================================
// JULIAN DATE CONVERSIONS
// ============================================================================

/**
 * Convert Unix timestamp (ms) to Julian Date
 * 
 * JD = Unix_ms / 86400000 + 2440587.5
 * 
 * @param unixMs - Unix timestamp in milliseconds
 * @returns Julian Date
 */
export function unixToJulian(unixMs: number): number {
  return unixMs / 86400000 + 2440587.5;
}

/**
 * Convert Julian Date to Unix timestamp (ms)
 * 
 * @param jd - Julian Date
 * @returns Unix timestamp in milliseconds
 */
export function julianToUnix(jd: number): number {
  return (jd - 2440587.5) * 86400000;
}

/**
 * Get current Julian Date
 */
export function getCurrentJulianDate(): number {
  return unixToJulian(Date.now());
}

/**
 * Convert Julian Date to J2000 time (seconds since J2000 epoch)
 * 
 * @param jd - Julian Date
 * @returns Seconds since J2000.0
 */
export function julianToJ2000(jd: number): number {
  return (jd - J2000_JD) * SECONDS_PER_DAY;
}

/**
 * Convert J2000 time to Julian Date
 * 
 * @param t - Seconds since J2000.0
 * @returns Julian Date
 */
export function j2000ToJulian(t: number): number {
  return t / SECONDS_PER_DAY + J2000_JD;
}

/**
 * Convert Julian Date to centuries since J2000
 * Commonly used in astronomical formulas
 * 
 * @param jd - Julian Date
 * @returns Julian centuries since J2000.0
 */
export function julianCenturies(jd: number): number {
  return (jd - J2000_JD) / 36525;
}

// ============================================================================
// CALENDAR CONVERSIONS
// ============================================================================

/**
 * Convert calendar date to Julian Date
 * Uses the proleptic Gregorian calendar
 * 
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59.999...)
 * @returns Julian Date
 */
export function calendarToJulian(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): number {
  // Algorithm from Meeus, "Astronomical Algorithms"
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + b - 1524.5 +
             (hour + minute / 60 + second / 3600) / 24;
  
  return jd;
}

/**
 * Convert Julian Date to calendar date
 * 
 * @param jd - Julian Date
 * @returns Object with year, month, day, hour, minute, second
 */
export function julianToCalendar(jd: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  // Algorithm from Meeus, "Astronomical Algorithms"
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  
  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  
  const dayFraction = f * 24;
  const hour = Math.floor(dayFraction);
  const minuteFraction = (dayFraction - hour) * 60;
  const minute = Math.floor(minuteFraction);
  const second = (minuteFraction - minute) * 60;
  
  return { year, month, day, hour, minute, second };
}

/**
 * Format Julian Date as ISO 8601 string
 */
export function julianToISO(jd: number): string {
  const cal = julianToCalendar(jd);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${cal.year}-${pad(cal.month)}-${pad(cal.day)}T${pad(cal.hour)}:${pad(cal.minute)}:${pad(Math.floor(cal.second))}Z`;
}

// ============================================================================
// SIMULATION TIME
// ============================================================================

/**
 * Format simulation time as human-readable string
 * 
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "1y 23d 4h 5m 6s")
 */
export function formatSimTime(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const sign = seconds < 0 ? '-' : '';
  
  const years = Math.floor(absSeconds / JULIAN_YEAR);
  let remaining = absSeconds % JULIAN_YEAR;
  
  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining = remaining % SECONDS_PER_DAY;
  
  const hours = Math.floor(remaining / 3600);
  remaining = remaining % 3600;
  
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs.toFixed(1)}s`);
  
  return sign + parts.join(' ');
}

/**
 * Parse time string to seconds
 * Accepts formats like "1y 2d 3h", "365d", "3600s"
 * 
 * @param timeStr - Time string
 * @returns Seconds
 */
export function parseTimeString(timeStr: string): number {
  let totalSeconds = 0;
  const pattern = /(-?\d+\.?\d*)\s*(y|d|h|m|s)/gi;
  let match: RegExpExecArray | null;
  
  while ((match = pattern.exec(timeStr)) !== null) {
    const value = parseFloat(match[1]!);
    const unit = match[2]!.toLowerCase();
    
    switch (unit) {
      case 'y':
        totalSeconds += value * JULIAN_YEAR;
        break;
      case 'd':
        totalSeconds += value * SECONDS_PER_DAY;
        break;
      case 'h':
        totalSeconds += value * 3600;
        break;
      case 'm':
        totalSeconds += value * 60;
        break;
      case 's':
        totalSeconds += value;
        break;
    }
  }
  
  return totalSeconds;
}

// ============================================================================
// EPOCH UTILITIES
// ============================================================================

/**
 * Get J2000.0 epoch as Date object
 */
export function getJ2000Date(): Date {
  return new Date(Date.UTC(2000, 0, 1, 12, 0, 0, 0));
}

/**
 * Calculate days since J2000.0
 * 
 * @param date - Date to calculate from
 * @returns Days since J2000.0 (can be negative)
 */
export function daysSinceJ2000(date: Date = new Date()): number {
  const jd = unixToJulian(date.getTime());
  return jd - J2000_JD;
}

/**
 * Get the epoch for a given preset
 * Returns Julian Date for the standard epoch of each system
 */
export function getPresetEpoch(preset: 'current' | 'j2000' | 'unix' = 'j2000'): number {
  switch (preset) {
    case 'current':
      return getCurrentJulianDate();
    case 'j2000':
      return J2000_JD;
    case 'unix':
      return 2440587.5; // 1970-01-01 00:00:00 UTC
  }
}
