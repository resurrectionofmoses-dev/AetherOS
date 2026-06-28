# Directory: /opt/aetheros/cph-hub/inference/
# Filename: append_samplers.py
# Purpose: Safely appends the 21 provided llama.cpp sampler arguments into the primary inference configuration file.

import json
import os

def append_sampler_config():
    config_file = "active_config.json"
    
    # Segmented into groups of 4 (and remaining) following the conquer logic
    new_samplers = {
        "group_1_core": {
            "temp": 0.800,
            "top_k": 40,
            "top_p": 0.900,
            "min_p": 0.000
        },
        "group_2_penalties": {
            "repeat_last_n": 64,
            "repeat_penalty": 1.100,
            "frequency_penalty": 0.000,
            "presence_penalty": 0.000
        },
        "group_3_dry": {
            "dry_multiplier": 0.000,
            "dry_base": 1.750,
            "dry_allowed_length": 2,
            "dry_penalty_last_n": 2048
        },
        "group_4_xtc": {
            "xtc_probability": 0.000,
            "xtc_threshold": 0.100,
            "typical_p": 1.000,
            "top_n_sigma": -1.000
        },
        "group_5_adaptive": {
            "mirostat": 0,
            "mirostat_lr": 0.100,
            "mirostat_ent": 5.000,
            "adaptive_target": -1.000,
            "adaptive_decay": 0.900
        }
    }

    # Initialize empty base if file does not exist to adhere to "never take away"
    existing_data = {}
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                pass 

    # Append the new sampler blocks to the existing data structure
    if "samplers" not in existing_data:
        existing_data["samplers"] = {}
    
    existing_data["samplers"].update(new_samplers)

    # Write the updated, combined data back to the file
    with open(config_file, 'w') as f:
        json.dump(existing_data, f, indent=4)

    print("Samplers successfully appended to active_config.json")

if __name__ == "__main__":
    append_sampler_config()
