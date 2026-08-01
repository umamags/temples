#!/usr/bin/env python3
"""
Sync temple data to React app static files.
Copies temples data from data/temples/ to public/data/temples/ for the React app.

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


def main():
    logger.info("Starting temples sync...")

    if sync_temples_data():
        logger.info("✓ Sync completed successfully")
        sys.exit(0)
    else:
        logger.error("✗ Sync completed with errors")
        sys.exit(1)


if __name__ == "__main__":
    main()
