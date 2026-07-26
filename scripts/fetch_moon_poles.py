"""
Fetch pole orientation (RA_pole, Dec_pole) for all FSS III/IV moons from JPL HORIZONS.

The HORIZONS OBJ_DATA section contains physical constants including pole RA/Dec.
This script extracts those values for each moon and writes a summary JSON.

Output: local/HORIZONS_POLES/moon_poles.json

*Note that the script is intended to be combined with fetch_horizons.py, and is not a standalone tool.
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import requests

HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "symplectica-pole-fetcher/1.0"})

# All moons in FSS III/IV + planets (for reference poles)
TARGETS = {
    # Planets (for reference)
    "Sun":       "10",
    "Mercury":   "199",
    "Venus":     "299",
    "Earth":     "399",
    "Mars":      "499",
    "Jupiter":   "599",
    "Saturn":    "699",
    "Uranus":    "799",
    "Neptune":   "899",
    "Pluto":     "999",
    # Earth moon
    "Moon":      "301",
    # Mars moons
    "Phobos":    "401",
    "Deimos":    "402",
    # Jupiter moons
    "Io":        "501",
    "Europa":    "502",
    "Ganymede":  "503",
    "Callisto":  "504",
    # Saturn moons
    "Mimas":     "601",
    "Enceladus": "602",
    "Tethys":    "603",
    "Dione":     "604",
    "Rhea":      "605",
    "Titan":     "606",
    "Iapetus":   "608",
    # Uranus moons
    "Miranda":   "705",
    "Ariel":     "701",
    "Umbriel":   "702",
    "Titania":   "703",
    "Oberon":    "704",
    # Neptune moons
    "Triton":    "801",
    "Nereid":    "802",
    # Pluto system
    "Charon":    "901",
}


def fetch_obj_data(naif_id: str) -> str:
    """Fetch HORIZONS response with OBJ_DATA for a body."""
    params = {
        "format": "json",
        "MAKE_EPHEM": "YES",
        "COMMAND": f"'{naif_id}'",
        "CENTER": "'500@10'",
        "EPHEM_TYPE": "VECTORS",
        "START_TIME": "'2026-01-01'",
        "STOP_TIME": "'2026-01-02'",
        "STEP_SIZE": "'1 d'",
        "OUT_UNITS": "KM-S",
        "REF_SYSTEM": "J2000",
        "REF_PLANE": "ECLIPTIC",
        "VEC_TABLE": "2",
        "OBJ_DATA": "YES",
    }
    r = SESSION.get(HORIZONS_URL, params=params, timeout=60)
    r.raise_for_status()
    data = r.json()
    return data.get("result", "")


def parse_pole_data(text: str, name: str) -> dict:
    """Extract pole RA, Dec, and rotation rate from HORIZONS OBJ_DATA text."""
    result = {
        "name": name,
        "pole_ra_deg": None,
        "pole_dec_deg": None,
        "obliquity_deg": None,
        "rotation_rate_rad_s": None,
        "raw_matches": {},
    }

    # ── Pole RA ──
    # Patterns vary by body type. Common formats:
    #   "Pole RA  (deg) = 268.05"
    #   "RA, deg, IAU-vector : 317.68"
    #   "pole_ra = 268.05"
    #   "North pole (IAU) RA = 286.13"
    ra_patterns = [
        # Generic "RA" near pole context
        r"[Pp]ole\s*(?:of\s+rotation\s*)?(?:\(IAU[^)]*\)\s*)?(?:direction\s+)?R\.?A\.?\s*(?:\(deg\)|\(degrees\))?\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"R\.?A\.?\s*,?\s*deg\s*,?\s*IAU[^:]*:\s*([+-]?\d+\.?\d*)",
        r"[Nn]orth\s+[Pp]ole\s*(?:\(IAU\)\s*)?R\.?A\.?\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"R\.?A\.?\s*\(?deg\)?\s*[:=]\s*([+-]?\d+\.?\d*)",
        # From SPICE kernel format appearing in HORIZONS
        r"pole_ra\s*[:=]\s*([+-]?\d+\.?\d*)",
    ]
    for pat in ra_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            result["pole_ra_deg"] = float(m.group(1))
            result["raw_matches"]["pole_ra"] = m.group(0)
            break

    # ── Pole Dec ──
    dec_patterns = [
        r"[Pp]ole\s*(?:of\s+rotation\s*)?(?:\(IAU[^)]*\)\s*)?(?:direction\s+)?[Dd]ec\.?\s*(?:\(deg\)|\(degrees\))?\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"[Dd]ec\.?\s*,?\s*deg\s*,?\s*IAU[^:]*:\s*([+-]?\d+\.?\d*)",
        r"[Nn]orth\s+[Pp]ole\s*(?:\(IAU\)\s*)?[Dd]ec\.?\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"[Dd]ec\.?\s*\(?deg\)?\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"pole_dec\s*[:=]\s*([+-]?\d+\.?\d*)",
    ]
    for pat in dec_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            result["pole_dec_deg"] = float(m.group(1))
            result["raw_matches"]["pole_dec"] = m.group(0)
            break

    # ── Obliquity ──
    obl_patterns = [
        r"[Oo]bliquity\s+to\s+orbit\s*[:=]\s*([+-]?\d+\.?\d*)",
        r"[Oo]bliquity\s*\(deg\)\s*[:=]\s*([+-]?\d+\.?\d*)",
    ]
    for pat in obl_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            result["obliquity_deg"] = float(m.group(1))
            result["raw_matches"]["obliquity"] = m.group(0)
            break

    # ── Rotation rate ──
    rot_patterns = [
        r"[Ss]id\.?\s*rot\.?\s*(?:period|rate)\s*\(?rad/s\)?\s*[:=]\s*([+-]?\d+\.?\d*(?:[Ee][+-]?\d+)?)",
        r"[Rr]ot\.?\s*[Rr]ate\s*\(rad/s\)\s*[:=]\s*([+-]?\d+\.?\d*(?:[Ee][+-]?\d+)?)",
    ]
    for pat in rot_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            result["rotation_rate_rad_s"] = float(m.group(1))
            result["raw_matches"]["rotation_rate"] = m.group(0)
            break

    return result


def main():
    # Output directory
    out_dir = Path(__file__).parent.parent / "local" / "HORIZONS_POLES"
    out_dir.mkdir(parents=True, exist_ok=True)

    results = {}
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("  Symplectica Moon Pole Fetcher v1.0")
    print("  Querying JPL HORIZONS for pole RA/Dec data")
    print(f"  Output: {out_dir}")
    print("=" * 60)

    for name, naif_id in TARGETS.items():
        print(f"\n-- {name} (NAIF {naif_id}) --")
        try:
            text = fetch_obj_data(naif_id)

            # Save raw response
            raw_path = raw_dir / f"{name.lower().replace('/', '_')}.txt"
            with open(raw_path, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"  Raw saved to {raw_path.name}")

            # Parse pole data
            pole = parse_pole_data(text, name)
            results[name] = pole

            if pole["pole_ra_deg"] is not None:
                print(f"  Pole RA  = {pole['pole_ra_deg']:.4f}°")
            else:
                print(f"  Pole RA  = NOT FOUND")

            if pole["pole_dec_deg"] is not None:
                print(f"  Pole Dec = {pole['pole_dec_deg']:.4f}°")
            else:
                print(f"  Pole Dec = NOT FOUND")

            if pole["obliquity_deg"] is not None:
                print(f"  Obliquity = {pole['obliquity_deg']:.4f}°")

        except Exception as e:
            print(f"  ERROR: {e}")
            results[name] = {"name": name, "error": str(e)}

        time.sleep(0.4)  # Rate limit

    # Write summary
    summary_path = out_dir / "moon_poles.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 60)
    print(f"  Results written to: {summary_path}")

    # Print summary table
    print("\n  SUMMARY TABLE:")
    print(f"  {'Body':<15} {'RA°':>10} {'Dec°':>10} {'Obliq°':>10}")
    print(f"  {'-'*15} {'-'*10} {'-'*10} {'-'*10}")
    for name, data in results.items():
        if "error" in data:
            print(f"  {name:<15} {'ERROR':>10}")
            continue
        ra = f"{data['pole_ra_deg']:.2f}" if data['pole_ra_deg'] is not None else "—"
        dec = f"{data['pole_dec_deg']:.2f}" if data['pole_dec_deg'] is not None else "—"
        obl = f"{data['obliquity_deg']:.2f}" if data.get('obliquity_deg') is not None else "—"
        print(f"  {name:<15} {ra:>10} {dec:>10} {obl:>10}")

    print("=" * 60)


if __name__ == "__main__":
    main()
