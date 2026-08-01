#!/usr/bin/env python3
"""
Sync temple data to React app static files.
Copies temples data from data/temples/ to public/data/temples/ for the React app.
Verifies that all cities with temple data have corresponding pins defined.

Usage:
  python syncTemples.py
"""

import json
import os
import sys
import logging
from pathlib import Path
from shutil import copy2
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('temples_sync.log')
    ]
)
logger = logging.getLogger(__name__)

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
TEMPLES_DIR = DATA_DIR / 'temples'
PUBLIC_DIR = PROJECT_ROOT / 'public'
PUBLIC_TEMPLES_DIR = PUBLIC_DIR / 'data' / 'temples'
SRC_DIR = PROJECT_ROOT / 'src'
CITIES_DATA_FILE = SRC_DIR / 'data' / 'citiesWithTempleData.js'

# Ensure public temples directory exists
PUBLIC_TEMPLES_DIR.mkdir(parents=True, exist_ok=True)


def sync_temples_data() -> bool:
    """
    Sync temples data from data/temples/ to public/data/temples/.

    Returns:
        True if successful, False otherwise
    """
    if not TEMPLES_DIR.exists():
        logger.error(f"Temples data directory not found: {TEMPLES_DIR}")
        logger.info("Run getTemples.py first to generate temple data")
        return False

    # Find all state JSON files
    state_files = list(TEMPLES_DIR.glob('*.json'))

    if not state_files:
        logger.warning(f"No temple data files found in {TEMPLES_DIR}")
        return False

    logger.info(f"Found {len(state_files)} state files to sync")

    copied = 0
    failed = 0

    for state_file in sorted(state_files):
        try:
            dest_file = PUBLIC_TEMPLES_DIR / state_file.name
            copy2(state_file, dest_file)
            logger.info(f"✓ Synced {state_file.name}")
            copied += 1
        except Exception as e:
            logger.error(f"✗ Failed to sync {state_file.name}: {e}")
            failed += 1

    # Create an index file
    try:
        index_data = {
            "description": "Temple data for Indian states",
            "last_synced": datetime.now().isoformat(),
            "states": []
        }

        for state_file in sorted(state_files):
            with open(state_file) as f:
                data = json.load(f)
                state_name = data.get("state", state_file.stem)
                city_count = len(data.get("cities", {}))
                temple_count = sum(len(temples) for temples in data.get("cities", {}).values())

                index_data["states"].append({
                    "name": state_name,
                    "file": state_file.name,
                    "cities": city_count,
                    "total_temples": temple_count,
                    "last_updated": data.get("last_updated", "")
                })

        index_file = PUBLIC_TEMPLES_DIR / 'index.json'
        with open(index_file, 'w') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✓ Created index file: {index_file}")

    except Exception as e:
        logger.error(f"Failed to create index file: {e}")
        failed += 1

    logger.info("\n" + "="*60)
    logger.info(f"SYNC SUMMARY: {copied} files synced, {failed} failed")
    logger.info(f"Output directory: {PUBLIC_TEMPLES_DIR}")
    logger.info("="*60)

    return failed == 0


def get_temples_for_city(state: str, city: str) -> list:
    """
    Get temples data for a specific city.

    Args:
        state: State name
        city: City name

    Returns:
        List of temples or empty list if not found
    """
    state_file = TEMPLES_DIR / f"{state}.json"

    if not state_file.exists():
        logger.warning(f"No data found for state: {state}")
        return []

    try:
        with open(state_file) as f:
            data = json.load(f)
            return data.get("cities", {}).get(city, [])
    except Exception as e:
        logger.error(f"Failed to read temples data for {city}, {state}: {e}")
        return []


def get_all_temples_for_state(state: str) -> dict:
    """
    Get all temples data for a state.

    Args:
        state: State name

    Returns:
        Dictionary with cities and their temples
    """
    state_file = TEMPLES_DIR / f"{state}.json"

    if not state_file.exists():
        logger.warning(f"No data found for state: {state}")
        return {}

    try:
        with open(state_file) as f:
            data = json.load(f)
            return data.get("cities", {})
    except Exception as e:
        logger.error(f"Failed to read temples data for {state}: {e}")
        return {}


def load_cities_with_temple_data() -> dict:
    """
    Load cities with temple data from citiesWithTempleData.js

    Returns:
        Dictionary mapping (state, city) to coordinates
    """
    cities_map = {}

    if not CITIES_DATA_FILE.exists():
        logger.warning(f"Cities data file not found: {CITIES_DATA_FILE}")
        return cities_map

    try:
        with open(CITIES_DATA_FILE, 'r') as f:
            content = f.read()
            # Extract the data array from the JS file
            # Find the array starting with [ and ending with ]
            start_idx = content.find('export const citiesWithTempleData = [')
            if start_idx == -1:
                # Try alternate format
                start_idx = content.find('= [')
                if start_idx == -1:
                    logger.warning("Could not find citiesWithTempleData array in JS file")
                    return cities_map
                start_idx = content.find('[', start_idx)

            # Find the closing bracket
            end_idx = content.rfind(']')
            if start_idx != -1 and end_idx > start_idx:
                # Extract just the array part
                json_str = content[start_idx:end_idx + 1]

                # Replace single quotes with double quotes for valid JSON
                json_str = json_str.replace("'", '"')

                cities_data = json.loads(json_str)
                for city in cities_data:
                    key = (city.get('state'), city.get('city'))
                    cities_map[key] = city
    except Exception as e:
        logger.error(f"Failed to parse cities data file: {e}")

    return cities_map


def verify_pin_refresh() -> tuple[bool, list, list]:
    """
    Verify that all cities with temple data have corresponding pins.

    Returns:
        Tuple of (all_verified, missing_pins, extra_pins)
        - all_verified: True if all cities have pins
        - missing_pins: List of (state, city) tuples without pins
        - extra_pins: List of (state, city) tuples with pins but no temple data
    """
    logger.info("\n" + "="*60)
    logger.info("CHECKING PIN REFRESH STATUS")
    logger.info("="*60)

    # Get all cities with temple data in files
    cities_with_data = {}
    state_files = list(TEMPLES_DIR.glob('*.json'))

    for state_file in state_files:
        try:
            with open(state_file) as f:
                data = json.load(f)
                state_name = data.get("state", state_file.stem)
                cities = data.get("cities", {})
                for city_name in cities.keys():
                    cities_with_data[(state_name, city_name)] = True
        except Exception as e:
            logger.warning(f"Failed to read {state_file.name}: {e}")

    logger.info(f"Found {len(cities_with_data)} cities with temple data in data/temples/")

    # Load configured pins
    configured_pins = load_cities_with_temple_data()
    logger.info(f"Found {len(configured_pins)} configured pins in citiesWithTempleData.js")

    # Check for missing pins (cities with data but no pins)
    missing_pins = []
    for state_city in cities_with_data.keys():
        if state_city not in configured_pins:
            missing_pins.append(state_city)

    # Check for extra pins (pins configured but no temple data)
    extra_pins = []
    for state_city in configured_pins.keys():
        if state_city not in cities_with_data:
            extra_pins.append(state_city)

    # Report results
    if missing_pins:
        logger.warning(f"\n⚠️  Missing pins for {len(missing_pins)} cities with temple data:")
        for state, city in sorted(missing_pins):
            logger.warning(f"   - {city}, {state}")

    if extra_pins:
        logger.warning(f"\n⚠️  Extra pins configured for {len(extra_pins)} cities without temple data:")
        for state, city in sorted(extra_pins):
            logger.warning(f"   - {city}, {state}")

    if not missing_pins and not extra_pins:
        logger.info("\n✓ All pins are properly configured for cities with temple data!")
        all_verified = True
    else:
        all_verified = False

    # Summary
    logger.info("\n" + "-"*60)
    logger.info("PIN VERIFICATION SUMMARY")
    logger.info("-"*60)
    logger.info(f"Cities with temple data:    {len(cities_with_data)}")
    logger.info(f"Configured pins:            {len(configured_pins)}")
    logger.info(f"Missing pins:               {len(missing_pins)}")
    logger.info(f"Extra pins:                 {len(extra_pins)}")
    logger.info(f"Status:                     {'✓ VERIFIED' if all_verified else '✗ NEEDS UPDATE'}")
    logger.info("="*60 + "\n")

    return all_verified, missing_pins, extra_pins


def main():
    logger.info("Starting temples sync...")

    sync_success = sync_temples_data()

    # Verify pin refresh status
    all_verified, missing_pins, extra_pins = verify_pin_refresh()

    if sync_success and all_verified:
        logger.info("✓ Sync completed successfully and all pins are verified")
        sys.exit(0)
    elif sync_success and not all_verified:
        logger.warning("⚠️  Sync completed but pin configuration needs update")
        sys.exit(0)  # Sync succeeded, but pins need manual update
    else:
        logger.error("✗ Sync completed with errors")
        sys.exit(1)


if __name__ == "__main__":
    main()
