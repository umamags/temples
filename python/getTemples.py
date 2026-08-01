#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch temple details from OpenAI for Indian cities.
Stores results in data/temples/<state>.json

Usage:
  python getTemples.py [--pilot] [--state STATE_NAME]

  --pilot: Run pilot for first city of 5 states
  --state: Run for specific state only
"""

import json
import os
import sys
import time
import logging
from pathlib import Path
from typing import Optional, Dict, List, Any
import argparse
from datetime import datetime

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Install with: pip install openai")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('temples_fetch.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
TEMPLES_DIR = DATA_DIR / 'temples'
STATES_FILE = DATA_DIR / 'states.json'
CITIES_FILE = DATA_DIR / 'cities.json'

# Ensure temples directory exists
TEMPLES_DIR.mkdir(parents=True, exist_ok=True)

# API Configuration
API_KEY = os.getenv('OPENAI_API_KEY')
if not API_KEY:
    logger.error("OPENAI_API_KEY environment variable not set")
    sys.exit(1)

client = OpenAI(api_key=API_KEY)
MODEL = "gpt-4o"
MAX_RETRIES = 2
RETRY_DELAY = 2  # seconds


def load_states_and_cities() -> tuple[Dict[str, str], Dict[str, List[str]]]:
    """Load states and cities from JSON files."""
    try:
        with open(STATES_FILE) as f:
            states_data = json.load(f)
        states = {s['name']: s['capital'] for s in states_data['states']}

        with open(CITIES_FILE) as f:
            cities_data = json.load(f)
        cities = {c['state']: c['cities'] for c in cities_data['cities']}

        logger.info(f"Loaded {len(states)} states and {sum(len(c) for c in cities.values())} cities")
        return states, cities
    except FileNotFoundError as e:
        logger.error(f"Failed to load data files: {e}")
        sys.exit(1)


def fetch_temples_openai(city: str, state: str, max_retries: int = MAX_RETRIES) -> Optional[Dict[str, Any]]:
    """
    Fetch temple details from OpenAI.

    Args:
        city: City name
        state: State name
        max_retries: Number of retry attempts

    Returns:
        Parsed JSON response or None if failed
    """
    prompt = f"""As a frequent traveller, provide basic details of top 5 temples found in the city {city} in {state}.

For each temple, include:
- Temple name
- Main deity
- Temple image (URL)
- Website
- Year constructed (as a number, e.g., 1234)
- Religious festivals and events

Output MUST be ONLY valid JSON, nothing else. Do NOT add markdown code fences. Do NOT add any text before or after the JSON.

JSON structure:
{{
  "temples": [
    {{
      "name": "Temple Name",
      "main_deity": "Deity Name",
      "image_url": "https://example.com/image.jpg",
      "website": null,
      "year_constructed": 1234,
      "festivals_and_events": ["Festival 1", "Festival 2"]
    }}
  ],
  "city": "{city}",
  "state": "{state}"
}}

Important:
- year_constructed MUST be a number, not a string
- website can be null if not available
- image_url MUST be a valid URL string
- All strings MUST be quoted
- Return ONLY the JSON object, no other text"""

    for attempt in range(max_retries + 1):
        try:
            logger.info(f"Fetching temples for {city}, {state} (attempt {attempt + 1}/{max_retries + 1})")

            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful travel assistant providing accurate information about Indian temples."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            response_text = response.choices[0].message.content.strip()
            logger.debug(f"Raw response length: {len(response_text)}")

            # Remove markdown code fences if present
            if response_text.startswith('```'):
                # Extract JSON from markdown code fences
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]  # Remove 'json' prefix
                response_text = response_text.strip()

            # Try to parse JSON - ensure proper encoding
            temples_data = json.loads(response_text, strict=False)
            logger.info(f"✓ Successfully fetched {len(temples_data.get('temples', []))} temples for {city}, {state}")

            return temples_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response for {city}, {state}: {e}")
            logger.debug(f"Response was: {response_text[:200]}")
        except Exception as e:
            error_msg = str(e).encode('utf-8', errors='replace').decode('utf-8')
            logger.error(f"API error for {city}, {state}: {error_msg}")

        if attempt < max_retries:
            logger.info(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)

    logger.error(f"✗ Failed to fetch temples for {city}, {state} after {max_retries + 1} attempts")
    return None


def temples_file_exists(state: str) -> bool:
    """Check if temples data already exists for a state."""
    file_path = TEMPLES_DIR / f"{state}.json"
    return file_path.exists()


def load_existing_temples(state: str) -> Dict[str, Any]:
    """Load existing temples data for a state."""
    file_path = TEMPLES_DIR / f"{state}.json"
    try:
        with open(file_path) as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load existing data for {state}: {e}")
        return {"cities": {}}


def save_temples_data(state: str, all_cities_data: Dict[str, Any]) -> bool:
    """Save temples data to JSON file."""
    file_path = TEMPLES_DIR / f"{state}.json"
    try:
        with open(file_path, 'w') as f:
            json.dump(all_cities_data, f, indent=2, ensure_ascii=False)
        logger.info(f"✓ Saved temples data to {file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save temples data for {state}: {e}")
        return False


def process_state(state: str, cities: List[str], skip_existing: bool = True, pilot_mode: bool = False) -> bool:
    """
    Process temples for all cities in a state.

    Args:
        state: State name
        cities: List of city names
        skip_existing: Skip cities with existing data
        pilot_mode: Only process first city

    Returns:
        True if successful, False otherwise
    """
    logger.info(f"\n{'='*60}")
    logger.info(f"Processing state: {state}")
    logger.info(f"{'='*60}")

    # Load existing data if available
    state_data = load_existing_temples(state)
    if "cities" not in state_data:
        state_data["cities"] = {}

    state_data["state"] = state
    state_data["last_updated"] = datetime.now().isoformat()

    # Determine cities to process
    all_cities_to_process = [cities[0]] if pilot_mode else cities

    # Filter out cities with existing data if skip_existing is True
    if skip_existing:
        cities_to_process = [city for city in all_cities_to_process if city not in state_data["cities"]]
        skipped = len(all_cities_to_process) - len(cities_to_process)
        if skipped > 0:
            logger.info(f"Skipping {skipped} city(cities) with existing data")
    else:
        cities_to_process = all_cities_to_process

    if not cities_to_process:
        logger.info(f"⊘ All cities in {state} already have temple data")
        return True

    logger.info(f"Processing {len(cities_to_process)} city(cities)")

    for idx, city in enumerate(cities_to_process, 1):
        logger.info(f"\n[{idx}/{len(cities_to_process)}] Processing: {city}")

        # Fetch temples data
        temples_data = fetch_temples_openai(city, state)

        if temples_data:
            state_data["cities"][city] = temples_data.get("temples", [])
            logger.info(f"Added {len(state_data['cities'][city])} temples for {city}")
        else:
            logger.warning(f"Skipping {city} due to fetch failure")
            state_data["cities"][city] = []

        # Small delay between requests to avoid rate limiting
        if idx < len(cities_to_process):
            time.sleep(0.5)

    # Save all data for the state
    if save_temples_data(state, state_data):
        logger.info(f"✓ Completed processing for {state}")
        return True
    else:
        logger.error(f"✗ Failed to save data for {state}")
        return False


def run_pilot(states: Dict[str, str], cities: Dict[str, List[str]]) -> None:
    """Run pilot for first 5 states."""
    logger.info("\n" + "="*60)
    logger.info("PILOT MODE: Processing first city of 5 states")
    logger.info("="*60)

    pilot_states = list(states.keys())[:5]
    successful = 0
    failed = 0

    for state in pilot_states:
        city_list = cities.get(state, [])
        if not city_list:
            logger.warning(f"No cities found for {state}")
            continue

        if process_state(state, city_list, skip_existing=False, pilot_mode=True):
            successful += 1
        else:
            failed += 1

        # Delay between states to avoid rate limiting
        time.sleep(1)

    logger.info("\n" + "="*60)
    logger.info(f"PILOT SUMMARY: {successful} successful, {failed} failed")
    logger.info("="*60)


def run_full(states: Dict[str, str], cities: Dict[str, List[str]], target_state: Optional[str] = None) -> None:
    """Run for all (or specific) states."""
    states_to_process = [target_state] if target_state else list(states.keys())

    logger.info("\n" + "="*60)
    logger.info(f"FULL MODE: Processing {len(states_to_process)} state(s)")
    logger.info("="*60)

    successful = 0
    failed = 0

    for state in states_to_process:
        if state not in cities:
            logger.warning(f"No cities found for {state}")
            continue

        city_list = cities[state]

        if process_state(state, city_list, skip_existing=True, pilot_mode=False):
            successful += 1
        else:
            failed += 1

        time.sleep(1)

    logger.info("\n" + "="*60)
    logger.info(f"FULL MODE SUMMARY: {successful} successful, {failed} failed")
    logger.info("="*60)


def main():
    # Ensure UTF-8 encoding for stdout
    import sys
    if sys.stdout.encoding != 'utf-8':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    parser = argparse.ArgumentParser(description="Fetch temple details from OpenAI for Indian cities")
    parser.add_argument('--pilot', action='store_true', help='Run pilot mode (first city of 5 states)')
    parser.add_argument('--state', type=str, help='Run for specific state only')
    parser.add_argument('--force', action='store_true', help='Force re-fetch even if data exists')

    args = parser.parse_args()

    logger.info("Starting temple data fetch...")
    logger.info(f"Model: {MODEL}")
    logger.info(f"Max retries: {MAX_RETRIES}")
    logger.info(f"Output directory: {TEMPLES_DIR}")

    # Load data
    states, cities = load_states_and_cities()

    # Run appropriate mode
    if args.pilot:
        run_pilot(states, cities)
    elif args.state:
        if args.state not in states:
            logger.error(f"State '{args.state}' not found")
            sys.exit(1)
        city_list = cities.get(args.state, [])
        process_state(args.state, city_list, skip_existing=not args.force, pilot_mode=False)
    else:
        run_full(states, cities, target_state=args.state if args.state else None)


if __name__ == "__main__":
    main()
