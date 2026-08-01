#!/usr/bin/env python3
"""
Fetch temple data for first city of remaining 23 states (excluding pilot states)
"""

import json
import subprocess
import sys
from pathlib import Path

# Pilot states already fetched
PILOT_STATES = {
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh'
}

# Load states and cities
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / 'data'

with open(DATA_DIR / 'states.json') as f:
    states_data = json.load(f)
all_states = [s['name'] for s in states_data['states']]

with open(DATA_DIR / 'cities.json') as f:
    cities_data = json.load(f)
cities_by_state = {c['state']: c['cities'] for c in cities_data['cities']}

# Get remaining states
remaining_states = [s for s in all_states if s not in PILOT_STATES]

print(f"Fetching temple data for first city of {len(remaining_states)} states...")
print(f"States: {', '.join(remaining_states)}\n")

# Set API key
import os
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("ERROR: OPENAI_API_KEY not set")
    sys.exit(1)

# Import and run fetcher
sys.path.insert(0, str(PROJECT_ROOT / 'python'))
from getTemples import fetch_temples_openai, save_temples_data, load_existing_temples

for state in remaining_states:
    cities = cities_by_state.get(state, [])
    if not cities:
        print(f"⚠️ No cities found for {state}, skipping")
        continue

    first_city = cities[0]
    print(f"\nProcessing: {first_city} ({state})")

    # Load existing data
    state_data = load_existing_temples(state)
    if "cities" not in state_data:
        state_data["cities"] = {}

    state_data["state"] = state

    # Fetch temples
    temples_data = fetch_temples_openai(first_city, state)

    if temples_data:
        state_data["cities"][first_city] = temples_data.get("temples", [])
        print(f"  ✓ Added {len(state_data['cities'][first_city])} temples")

        # Save
        if save_temples_data(state, state_data):
            print(f"  ✓ Saved")
        else:
            print(f"  ✗ Failed to save")
    else:
        print(f"  ✗ Failed to fetch")

print("\n" + "="*60)
print("✓ Remaining states processing complete")
print("="*60)
