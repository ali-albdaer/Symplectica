#!/usr/bin/env python3
"""
JPL HORIZONS Solar System Ephemeris Fetcher for Symplectica
============================================================

Fetches state vectors, orbital elements, and physical data from JPL HORIZONS
for constructing high-fidelity solar system presets in Symplectica.

Configuration:
  - EPOCH: Target date for ephemeris data
  - OVERRIDE: If True, re-fetch even if output file already exists
  - CENTER: HORIZONS observer center (default: heliocentric ecliptic J2000)
  - BODIES: Dict of label -> {id, type, parent} for each body to query

Output:
  JSON file in fetched/<label>_<epoch>.json per body, plus a combined manifest.

Requirements:
  pip install requests

Usage:
  python fetch_horizons.py
  python fetch_horizons.py --epoch 2026-01-01 --override
  python fetch_horizons.py --bodies Sun Earth Moon

Alternatives to HORIZONS:
  - Astroquery (Python): Clean wrapper around HORIZONS. Adds astropy dependency.
  - SPICE/spiceypy: Highest precision, offline. Requires kernel downloads (~GB).
    Good for planets/moons, poor for comets. Best for production pipelines.
  - NASA SBDB (Small-Body Database): Good for asteroid/comet physical data
    (mass, radius, albedo) but no state vectors at arbitrary epochs.
    Useful as a supplement for physical properties HORIZONS doesn't return.

For Symplectica's needs, HORIZONS REST API is ideal: free, no dependencies
beyond requests, covers all body types, and provides both state vectors and
orbital elements at arbitrary epochs.
"""

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Optional

import requests

# ═══════════════════════════════════════════════════════════════════════════
# GLOBAL CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

EPOCH = "2026-01-01"       # Target date (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
OVERRIDE = False           # If True, re-fetch even if output file exists
CENTER = "500@10"          # Heliocentric ecliptic J2000 (Sun body-center)

# Body dictionary: label -> {id, type, parent}
# NAIF IDs: https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/naif_ids.html
BODIES = {
    # ── Stars ────────────────────────────────────────────────────────────
    "Sun":       {"id": "10",       "type": "Star",      "parent": None},

    # ── Planets ──────────────────────────────────────────────────────────
    "Mercury":   {"id": "199",      "type": "Planet",    "parent": "Sun"},
    "Venus":     {"id": "299",      "type": "Planet",    "parent": "Sun"},
    "Earth":     {"id": "399",      "type": "Planet",    "parent": "Sun"},
    "Mars":      {"id": "499",      "type": "Planet",    "parent": "Sun"},
    "Jupiter":   {"id": "599",      "type": "Planet",    "parent": "Sun"},
    "Saturn":    {"id": "699",      "type": "Planet",    "parent": "Sun"},
    "Uranus":    {"id": "799",      "type": "Planet",    "parent": "Sun"},
    "Neptune":   {"id": "899",      "type": "Planet",    "parent": "Sun"},
    "Pluto":     {"id": "999",      "type": "Planet",    "parent": "Sun"},

    # ── Earth's Moon ─────────────────────────────────────────────────────
    "Moon":      {"id": "301",      "type": "Moon",      "parent": "Earth"},

    # ── Mars moons ───────────────────────────────────────────────────────
    "Phobos":    {"id": "401",      "type": "Moon",      "parent": "Mars"},
    "Deimos":    {"id": "402",      "type": "Moon",      "parent": "Mars"},

    # ── Jupiter moons (Galilean) ─────────────────────────────────────────
    "Io":        {"id": "501",      "type": "Moon",      "parent": "Jupiter"},
    "Europa":    {"id": "502",      "type": "Moon",      "parent": "Jupiter"},
    "Ganymede":  {"id": "503",      "type": "Moon",      "parent": "Jupiter"},
    "Callisto":  {"id": "504",      "type": "Moon",      "parent": "Jupiter"},

    # ── Saturn moons ─────────────────────────────────────────────────────
    "Mimas":     {"id": "601",      "type": "Moon",      "parent": "Saturn"},
    "Enceladus": {"id": "602",      "type": "Moon",      "parent": "Saturn"},
    "Tethys":    {"id": "603",      "type": "Moon",      "parent": "Saturn"},
    "Dione":     {"id": "604",      "type": "Moon",      "parent": "Saturn"},
    "Rhea":      {"id": "605",      "type": "Moon",      "parent": "Saturn"},
    "Titan":     {"id": "606",      "type": "Moon",      "parent": "Saturn"},
    "Iapetus":   {"id": "608",      "type": "Moon",      "parent": "Saturn"},

    # ── Uranus moons ─────────────────────────────────────────────────────
    "Miranda":   {"id": "705",      "type": "Moon",      "parent": "Uranus"},
    "Ariel":     {"id": "701",      "type": "Moon",      "parent": "Uranus"},
    "Umbriel":   {"id": "702",      "type": "Moon",      "parent": "Uranus"},
    "Titania":   {"id": "703",      "type": "Moon",      "parent": "Uranus"},
    "Oberon":    {"id": "704",      "type": "Moon",      "parent": "Uranus"},

    # ── Neptune moons ────────────────────────────────────────────────────
    "Triton":    {"id": "801",      "type": "Moon",      "parent": "Neptune"},
    "Nereid":    {"id": "802",      "type": "Moon",      "parent": "Neptune"},

    # ── Pluto system ─────────────────────────────────────────────────────
    "Charon":    {"id": "901",      "type": "Moon",      "parent": "Pluto"},

    # ── Asteroids ────────────────────────────────────────────────────────
    "Ceres":     {"id": "DES=2000001;",  "type": "Asteroid",  "parent": "Sun"},
    "Pallas":    {"id": "DES=2000002;",  "type": "Asteroid",  "parent": "Sun"},
    "Vesta":     {"id": "DES=2000004;",  "type": "Asteroid",  "parent": "Sun"},

    # ── Comets (use DES= syntax for unambiguous lookup) ──────────────────
    "1P/Halley":                    {"id": "DES=1P;CAP",                         "type": "Comet", "parent": "Sun"},
    "2P/Encke":                     {"id": "DES=2P;CAP",                         "type": "Comet", "parent": "Sun"},
    "67P/Churyumov-Gerasimenko":    {"id": "DES=67P;CAP",                        "type": "Comet", "parent": "Sun"},
    "C/1995 O1 (Hale-Bopp)":        {"id": "DES=C/1995 O1;",                     "type": "Comet", "parent": "Sun"},
    "109P/Swift-Tuttle":            {"id": "DES=109P;CAP",                       "type": "Comet", "parent": "Sun"},
}

# ═══════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════

HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"
G = 6.67430e-11  # m³ kg⁻¹ s⁻² (IAU 2015)
KM_TO_M = 1000.0
API_DELAY = 0.3   # seconds between requests (rate limiting)

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "symplectica-horizons-fetcher/2.0"})

# ═══════════════════════════════════════════════════════════════════════════
# EPOCH HANDLING
# ═══════════════════════════════════════════════════════════════════════════

def parse_epoch(epoch_str: str) -> tuple[str, str]:
    """Convert epoch string to HORIZONS START_TIME and STOP_TIME.
    STOP_TIME = START_TIME + 1 day (HORIZONS rejects START == STOP for VECTORS)."""
    s = epoch_str.replace("T", " ").strip()
    try:
        if len(s) == 10:
            t0 = dt.datetime.fromisoformat(s)
        else:
            t0 = dt.datetime.fromisoformat(s)
    except ValueError:
        t0 = dt.datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S")
    t1 = t0 + dt.timedelta(days=1)
    return t0.strftime("%Y-%m-%d %H:%M:%S"), t1.strftime("%Y-%m-%d %H:%M:%S")


# ═══════════════════════════════════════════════════════════════════════════
# HORIZONS API CALLS
# ═══════════════════════════════════════════════════════════════════════════

def fetch_vectors(command: str, start: str, stop: str) -> dict:
    """Fetch state vectors (position + velocity) from HORIZONS."""
    params = {
        "format": "json",
        "MAKE_EPHEM": "YES",
        "COMMAND": f"'{command}'",
        "CENTER": f"'{CENTER}'",
        "EPHEM_TYPE": "VECTORS",
        "START_TIME": f"'{start}'",
        "STOP_TIME": f"'{stop}'",
        "STEP_SIZE": "'1 d'",
        "OUT_UNITS": "KM-S",
        "REF_SYSTEM": "J2000",
        "REF_PLANE": "ECLIPTIC",
        "VEC_TABLE": "2",          # State vectors only (x,y,z,vx,vy,vz)
        "VEC_LABELS": "YES",
        "OBJ_DATA": "YES",
    }
    r = SESSION.get(HORIZONS_URL, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def fetch_elements(command: str, start: str, stop: str) -> dict:
    """Fetch osculating orbital elements from HORIZONS."""
    params = {
        "format": "json",
        "MAKE_EPHEM": "YES",
        "COMMAND": f"'{command}'",
        "CENTER": f"'{CENTER}'",
        "EPHEM_TYPE": "ELEMENTS",
        "START_TIME": f"'{start}'",
        "STOP_TIME": f"'{stop}'",
        "STEP_SIZE": "'1 d'",
        "OUT_UNITS": "KM-S",
        "REF_SYSTEM": "J2000",
        "REF_PLANE": "ECLIPTIC",
        "OBJ_DATA": "NO",
    }
    r = SESSION.get(HORIZONS_URL, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


# ═══════════════════════════════════════════════════════════════════════════
# PARSING
# ═══════════════════════════════════════════════════════════════════════════

def extract_soe(text: str) -> Optional[str]:
    """Extract content between $$SOE and $$EOE markers."""
    i = text.find("$$SOE")
    j = text.find("$$EOE")
    if i == -1 or j == -1 or j <= i:
        return None
    return text[i + 5:j].strip()


def parse_state_vectors(text: str) -> Optional[dict]:
    """Parse state vectors from VECTORS response. Returns SI units (m, m/s)."""
    soe = extract_soe(text)
    if not soe:
        return None

    # Look for labeled format: X = ..., Y = ..., etc.
    values = {}
    for label in ["X", "Y", "Z", "VX", "VY", "VZ"]:
        pattern = rf"{label}\s*=\s*([+-]?\d+\.?\d*[Ee][+-]?\d+|[+-]?\d+\.?\d*)"
        m = re.search(pattern, soe)
        if m:
            values[label] = float(m.group(1))

    if len(values) == 6:
        return {
            "x_m":    values["X"]  * KM_TO_M,
            "y_m":    values["Y"]  * KM_TO_M,
            "z_m":    values["Z"]  * KM_TO_M,
            "vx_m_s": values["VX"] * KM_TO_M,
            "vy_m_s": values["VY"] * KM_TO_M,
            "vz_m_s": values["VZ"] * KM_TO_M,
        }
    return None


def parse_orbital_elements(text: str) -> Optional[dict]:
    """Parse osculating orbital elements from ELEMENTS response."""
    soe = extract_soe(text)
    if not soe:
        return None

    # HORIZONS elements format uses labels like "EC= ...", "QR= ...", "IN= ...", etc.
    # We need careful regex to avoid "A" matching inside "MA" or "W" matching inside "QW".
    # Solution: require that the key is preceded by a newline/whitespace/comma and
    # followed immediately by whitespace then '='.
    fields = {
        "EC":  "eccentricity",
        "IN":  "inclination_deg",
        "OM":  "longitude_asc_node_deg",
        "MA":  "mean_anomaly_deg",
        "TP":  "periapsis_time_jd",
        "PR":  "period_sec",
    }

    result = {}
    for key, name in fields.items():
        pattern = rf"(?<![A-Z]){key}\s*=\s*([+-]?\d+\.?\d*[Ee][+-]?\d+|[+-]?\d+\.?\d*)"
        m = re.search(pattern, soe)
        if m:
            result[name] = float(m.group(1))

    # Parse 'A' (semi-major axis) separately with strict boundary
    # Must not be preceded by M (MA), Q (QA), or any letter
    a_match = re.search(r"(?<![A-Z])A\s*=\s*([+-]?\d+\.?\d*[Ee][+-]?\d+|[+-]?\d+\.?\d*)", soe)
    if a_match:
        result["semi_major_axis_m"] = float(a_match.group(1)) * KM_TO_M

    # Parse 'W' (argument of periapsis) with strict boundary
    w_match = re.search(r"(?<![A-Z])W\s*=\s*([+-]?\d+\.?\d*[Ee][+-]?\d+|[+-]?\d+\.?\d*)", soe)
    if w_match:
        result["arg_periapsis_deg"] = float(w_match.group(1))

    if "period_sec" in result:
        result["period_days"] = result["period_sec"] / 86400.0

    return result if result else None


def parse_physical_data(text: str) -> dict:
    """Parse physical data (GM, mass, radius) from OBJ_DATA in the response."""
    result = {"gm_km3_s2": None, "mass_kg": None, "radius_m": None, "notes": []}

    # GM (km³/s²)
    gm_patterns = [
        r"GM[,\s]*\(?km\^?3/s\^?2\)?\s*[:=]\s*([+-]?\d+\.?\d*(?:[Ee][+-]?\d+)?)",
        r"GM\s*[:=]\s*([+-]?\d+\.?\d*(?:[Ee][+-]?\d+)?)\s*km",
    ]
    for pat in gm_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            gm = float(m.group(1))
            result["gm_km3_s2"] = gm
            result["mass_kg"] = (gm * 1e9) / G
            result["notes"].append(f"mass derived from GM={gm} km³/s²")
            break

    # Direct mass in kg (fallback)
    if result["mass_kg"] is None:
        m = re.search(r"Mass\s*[:=]\s*\(?(\d+\.?\d*(?:[Ee][+-]?\d+)?)\)?\s*kg", text, re.IGNORECASE)
        if m:
            result["mass_kg"] = float(m.group(1))
            result["notes"].append("mass parsed directly in kg")

    # Mass as multiplier: "Mass, 10^24 kg = 5.9722" or "Mass x10^23 (kg)= 6.4171"
    if result["mass_kg"] is None:
        m = re.search(r"Mass[,\s]*(?:x?\s*)?10\^(\d+)\s*\(?kg\)?\s*[:=]\s*([+-]?\d+\.?\d*)", text, re.IGNORECASE)
        if m:
            exp = int(m.group(1))
            val = float(m.group(2))
            result["mass_kg"] = val * (10 ** exp)
            result["notes"].append(f"mass parsed as {val}×10^{exp} kg")

    # Radius (km) — "Target radii: 6378.137, 6378.137, 6356.752 km"
    r_match = re.search(r"Target radii\s*:\s*([\d.,\s]+)\s*km", text, re.IGNORECASE)
    if r_match:
        parts = [float(x) for x in re.findall(r"\d+\.?\d*", r_match.group(1))]
        if parts:
            mean_r = sum(parts) / len(parts)
            result["radius_m"] = mean_r * KM_TO_M
            result["notes"].append(f"radius from Target radii ({len(parts)} values, mean={mean_r:.1f} km)")

    # Single radius fallback
    if result["radius_m"] is None:
        m = re.search(r"(?:Mean )?[Rr]adius\s*\(?km\)?\s*[:=]\s*(\d+\.?\d*)", text, re.IGNORECASE)
        if m:
            result["radius_m"] = float(m.group(1)) * KM_TO_M
            result["notes"].append(f"radius from single value: {m.group(1)} km")

    return result


# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

def validate_body(data: dict, label: str) -> list[str]:
    """Run sanity checks on fetched data. Returns list of warnings."""
    warnings = []

    sv = data.get("state_vector")
    if sv:
        r = (sv["x_m"]**2 + sv["y_m"]**2 + sv["z_m"]**2) ** 0.5
        v = (sv["vx_m_s"]**2 + sv["vy_m_s"]**2 + sv["vz_m_s"]**2) ** 0.5

        # Sun should be at origin
        if label == "Sun" and r > 1e6:
            warnings.append(f"Sun not at origin: r={r:.3e} m")

        # Planets should be within ~100 AU
        AU = 1.496e11
        if data.get("type") == "Planet" and r > 200 * AU:
            warnings.append(f"Distance suspiciously large: {r/AU:.1f} AU")

        # Velocity sanity: should be < 100 km/s for planets
        if data.get("type") == "Planet" and v > 1e5:
            warnings.append(f"Velocity suspiciously large: {v/1000:.1f} km/s")

    phys = data.get("physical", {})
    if phys.get("mass_kg") is not None and phys["mass_kg"] <= 0:
        warnings.append(f"Non-positive mass: {phys['mass_kg']}")
    if phys.get("radius_m") is not None and phys["radius_m"] <= 0:
        warnings.append(f"Non-positive radius: {phys['radius_m']}")

    return warnings


# ═══════════════════════════════════════════════════════════════════════════
# MAIN FETCH LOGIC
# ═══════════════════════════════════════════════════════════════════════════

def fetch_body(label: str, body_info: dict, start: str, stop: str) -> dict:
    """Fetch all data for a single body. Returns structured dict."""
    hid = body_info["id"]
    btype = body_info["type"]
    parent = body_info.get("parent")

    result = {
        "label": label,
        "horizons_id": hid,
        "type": btype,
        "parent": parent,
        "epoch": start,
        "state_vector": None,
        "orbital_elements": None,
        "physical": None,
        "status": "OK",
        "warnings": [],
        "errors": [],
    }

    # 1. Fetch state vectors
    print(f"  [VECTORS] {label} (COMMAND={hid})...", end=" ", flush=True)
    try:
        vec_resp = fetch_vectors(hid, start, stop)
        vec_text = vec_resp.get("result", "")

        # Check for HORIZONS error
        if "Cannot find" in vec_text or "No matches found" in vec_text:
            result["errors"].append(f"HORIZONS could not find body: {hid}")
            result["status"] = "ERROR"
            print("NOT FOUND")
            return result

        if "Multiple matching" in vec_text:
            result["errors"].append(f"Ambiguous ID '{hid}' — multiple matches. Use DES= syntax.")
            result["status"] = "ERROR"
            print("AMBIGUOUS")
            return result

        sv = parse_state_vectors(vec_text)
        if sv:
            result["state_vector"] = sv
            print("OK")
        else:
            result["errors"].append("Failed to parse state vectors from response")
            result["status"] = "PARTIAL"
            print("PARSE FAILED")

        # Parse physical data from OBJ_DATA (included in VECTORS response)
        phys = parse_physical_data(vec_text)
        result["physical"] = phys

    except requests.RequestException as e:
        result["errors"].append(f"HTTP error: {e}")
        result["status"] = "ERROR"
        print(f"HTTP ERROR: {e}")
        return result

    time.sleep(API_DELAY)

    # 2. Fetch orbital elements (skip for Sun — it's at the origin)
    if label != "Sun":
        print(f"  [ELEMENTS] {label}...", end=" ", flush=True)
        try:
            elem_resp = fetch_elements(hid, start, stop)
            elem_text = elem_resp.get("result", "")
            oe = parse_orbital_elements(elem_text)
            if oe:
                result["orbital_elements"] = oe
                print("OK")
            else:
                result["warnings"].append("Could not parse orbital elements")
                print("PARSE FAILED (non-critical)")
        except requests.RequestException as e:
            result["warnings"].append(f"Elements request failed: {e}")
            print(f"FAILED (non-critical)")

        time.sleep(API_DELAY)

    # 3. Validate
    result["warnings"].extend(validate_body(result, label))

    if result["errors"]:
        result["status"] = "ERROR"
    elif result["warnings"]:
        result["status"] = "WARNING"

    return result


# ═══════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Fetch HORIZONS ephemeris data for Symplectica solar system presets.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python fetch_horizons.py                              # Fetch all bodies at default epoch
  python fetch_horizons.py --epoch 2025-06-15           # Different epoch
  python fetch_horizons.py --bodies Earth Moon Mars      # Specific bodies only
  python fetch_horizons.py --override                    # Force re-fetch
        """,
    )
    parser.add_argument("--epoch", default=EPOCH, help=f"Target epoch (default: {EPOCH})")
    parser.add_argument("--override", action="store_true", default=OVERRIDE,
                        help="Re-fetch even if output file exists")
    parser.add_argument("--bodies", nargs="+", default=None,
                        help="Specific body labels to fetch (default: all)")
    parser.add_argument("--delay", type=float, default=API_DELAY,
                        help=f"Delay between API calls in seconds (default: {API_DELAY})")
    args = parser.parse_args()

    # Determine output directory
    script_dir = Path(__file__).parent
    out_dir = script_dir / "fetched"
    out_dir.mkdir(exist_ok=True)

    epoch_label = args.epoch.replace(":", "-").replace("T", "_")
    manifest_path = out_dir / f"solar_system_{epoch_label}.json"

    if manifest_path.exists() and not args.override:
        print(f"Output already exists: {manifest_path}")
        print("Use --override to re-fetch.")
        sys.exit(0)

    # Parse epoch
    start_time, stop_time = parse_epoch(args.epoch)
    print(f"===========================================================")
    print(f"  Symplectica HORIZONS Fetcher v2.0")
    print(f"  Epoch:  {args.epoch}")
    print(f"  Center: {CENTER} (heliocentric ecliptic J2000)")
    print(f"  Output: {manifest_path}")
    print(f"===========================================================")

    # Select bodies
    if args.bodies:
        selected = {}
        for label in args.bodies:
            if label in BODIES:
                selected[label] = BODIES[label]
            else:
                print(f"  WARNING: Unknown body '{label}'. Available: {', '.join(BODIES.keys())}")
        if not selected:
            print("No valid bodies selected. Exiting.")
            sys.exit(1)
    else:
        selected = BODIES

    print(f"\nFetching {len(selected)} bodies...\n")

    # Fetch all bodies
    api_delay = args.delay

    manifest = {
        "meta": {
            "epoch": args.epoch,
            "start_time": start_time,
            "stop_time": stop_time,
            "center": CENTER,
            "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
            "generator": "symplectica-horizons-fetcher-v2.0",
        },
        "bodies": {},
        "summary": {"total": 0, "ok": 0, "warning": 0, "error": 0, "partial": 0},
    }

    for label, info in selected.items():
        print(f"-- {label} --")
        body_data = fetch_body(label, info, start_time, stop_time)
        manifest["bodies"][label] = body_data
        manifest["summary"]["total"] += 1
        status = body_data["status"].lower()
        if status in manifest["summary"]:
            manifest["summary"][status] += 1
        print()

    # Write manifest
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    # Print summary
    s = manifest["summary"]
    print(f"===========================================================")
    print(f"  RESULTS")
    print(f"  Total:    {s['total']}")
    print(f"  OK:       {s['ok']}")
    print(f"  Warning:  {s['warning']}")
    print(f"  Partial:  {s['partial']}")
    print(f"  Error:    {s['error']}")
    print(f"===========================================================")
    print(f"  Output: {manifest_path}")

    if s["error"] > 0:
        print(f"\n  [!] {s['error']} bodies had errors:")
        for label, data in manifest["bodies"].items():
            if data["status"] == "ERROR":
                print(f"    - {label}: {'; '.join(data['errors'])}")

    if s["warning"] > 0:
        print(f"\n  [!] {s['warning']} bodies had warnings:")
        for label, data in manifest["bodies"].items():
            if data["status"] == "WARNING":
                print(f"    - {label}: {'; '.join(data['warnings'])}")

    print()


if __name__ == "__main__":
    main()
