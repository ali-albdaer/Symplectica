"""
A set of exponentially-spaced snapshots for testing n-body simulations.
"""


import os
import subprocess
import shutil

EPOCHS = [
    "2026-01-01T00:01:00",
    "2026-01-01T00:10:00",
    "2026-01-01T01:00:00",
    "2026-01-01T12:00:00",
    "2026-01-02T00:00:00",
    "2026-01-08T00:00:00",
    "2026-02-01T00:00:00",
    "2026-07-01T00:00:00",
    "2027-01-01T00:00:00",
    "2028-01-01T00:00:00",
    "2031-01-01T00:00:00",
    "2036-01-01T00:00:00",
    "2051-01-01T00:00:00",
    "2076-01-01T00:00:00",
    "2100-01-01T00:00:00",
]

TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "local", "FSS_IV", "SNAPSHOTS"))
FETCH_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "local", "fetched_v2"))
SCRIPT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "fetch_horizons_v2.py"))

def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    for epoch in EPOCHS:
        epoch_label = epoch.replace(":", "-").replace("T", "_")
        target_file = os.path.join(TARGET_DIR, f"snapshot_{epoch_label}.json")
        
        if os.path.exists(target_file):
            print(f"Skipping {epoch}, target file already exists.")
            continue
            
        print(f"Fetching HORIZONS data for {epoch}...")
        
        # Invoke fetch_horizons_v2.py
        cmd = [
            "python",
            SCRIPT_PATH,
            "--epoch", epoch,
            "--override"
        ]
        
        # Run it
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to fetch data for {epoch}: {e}")
            continue
            
        # The script outputs to local/fetched_v2/solar_system_{epoch_label}.json
        fetched_file = os.path.join(FETCH_DIR, f"solar_system_{epoch_label}.json")
        
        if os.path.exists(fetched_file):
            shutil.copy2(fetched_file, target_file)
            print(f"Saved snapshot to {target_file}")
        else:
            print(f"Error: expected output file {fetched_file} not found.")

if __name__ == "__main__":
    main()
