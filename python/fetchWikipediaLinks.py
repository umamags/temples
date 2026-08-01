#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch Wikipedia links for temples and update temple data files.
Implements rate limiting to respect Wikipedia API guidelines.

Usage:
  python fetchWikipediaLinks.py [--state STATE_NAME] [--demo] [--demo-count N]

  --demo: Run demo mode (show changes without saving)
  --demo-count N: Number of temples to process in demo (default: 5)
  --state STATE_NAME: Process specific state only
  --dry-run: Show what would be changed without modifying files

Examples:
  python fetchWikipediaLinks.py --demo --demo-count 5
  python fetchWikipediaLinks.py --state "Andhra Pradesh"
  python fetchWikipediaLinks.py --state "Tamil Nadu" --demo
"""

import json
import sys
import time
import logging
import argparse
from pathlib import Path
from typing import Optional, Dict, List
import urllib.parse
import urllib.request
import ssl
import certifi

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
TEMPLES_DIR = DATA_DIR / 'temples'

# Rate limiting: 1 request per 0.5 seconds (respectful to Wikipedia)
RATE_LIMIT_DELAY = 0.5


def search_wikipedia(temple_name: str, state: str, city: str) -> Optional[str]:
    """
    Search Wikipedia for a temple and return the Wikipedia URL if found.

    Args:
        temple_name: Name of the temple
        state: State where temple is located
        city: City where temple is located

    Returns:
        Wikipedia URL if found, None otherwise
        Raises SystemExit if rate limited
    """
    try:
        # Build search query
        search_query = f"{temple_name} temple {city} {state}"

        logger.debug(f"Searching Wikipedia for: {search_query}")

        # Use Wikipedia's search API
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            'action': 'query',
            'list': 'search',
            'srsearch': search_query,
            'srnamespace': 0,  # Main namespace only
            'srlimit': 3,  # Get top 3 results
            'format': 'json',
        }

        # Make request with SSL context
        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"

        # Create SSL context
        try:
            ssl_context = ssl.create_default_context(cafile=certifi.where())
        except:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

        # Create request with User-Agent header
        request = urllib.request.Request(
            full_url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )

        with urllib.request.urlopen(request, timeout=5, context=ssl_context) as response:
            data = json.loads(response.read().decode('utf-8'))

        # Check if we got results
        search_results = data.get('query', {}).get('search', [])

        if search_results:
            # Filter results: prioritize those that mention "temple" or exact name matches
            filtered_results = []
            for result in search_results:
                title = result['title'].lower()
                temple_name_lower = temple_name.lower()

                # Prefer exact name matches or pages with "temple" in title
                if temple_name_lower in title or 'temple' in title:
                    filtered_results.append(result)

            # If no temple-specific results, use all results
            if not filtered_results:
                filtered_results = search_results

            # Get the first result
            top_result = filtered_results[0]
            page_title = top_result['title']

            # Build Wikipedia URL
            wikipedia_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(page_title)}"

            logger.info(f"✓ Found: {temple_name} → {wikipedia_url}")
            return wikipedia_url
        else:
            logger.warning(f"✗ Not found on Wikipedia: {temple_name}")
            return None

    except urllib.error.HTTPError as e:
        if e.code == 429:  # Rate limited
            logger.error(f"✗ Rate limited by Wikipedia (HTTP 429)")
            logger.error("Please try again later or increase rate limit delay")
            sys.exit(1)
        else:
            logger.error(f"HTTP Error {e.code} for {temple_name}: {e}")
            return None
    except Exception as e:
        logger.error(f"Error searching Wikipedia for {temple_name}: {e}")
        return None


def process_temples(state: Optional[str] = None, demo_mode: bool = False,
                   demo_count: int = 5, dry_run: bool = False) -> Dict[str, int]:
    """
    Process temples and fetch Wikipedia links.

    Args:
        state: Specific state to process, or None for all
        demo_mode: If True, only process demo_count temples
        demo_count: Number of temples to process in demo mode
        dry_run: If True, don't save changes

    Returns:
        Dictionary with statistics
    """
    stats = {
        'total_temples': 0,
        'updated': 0,
        'not_found': 0,
        'errors': 0,
        'skipped': 0,
    }

    # Get list of state files to process
    if state:
        state_files = [TEMPLES_DIR / f"{state}.json"]
    else:
        state_files = sorted(TEMPLES_DIR.glob('*.json'))

    # Filter out index.json
    state_files = [f for f in state_files if f.name != 'index.json']

    total_processed = 0

    for state_file in state_files:
        state_name = state_file.stem
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing state: {state_name}")
        logger.info(f"{'='*60}")

        try:
            with open(state_file, 'r', encoding='utf-8') as f:
                state_data = json.load(f)

            cities = state_data.get('cities', {})

            for city_name, temples in cities.items():
                for temple_idx, temple in enumerate(temples):
                    # Check demo mode limit
                    if demo_mode and total_processed >= demo_count:
                        logger.info(f"\nDemo mode: Processed {total_processed} temples. Stopping.")
                        break

                    stats['total_temples'] += 1
                    temple_name = temple.get('name', 'Unknown')
                    current_website = temple.get('website', '')

                    logger.info(f"\n[{total_processed + 1}] {temple_name}")
                    logger.info(f"    City: {city_name}, State: {state_name}")

                    # Check if already has Wikipedia link
                    if current_website and 'en.wikipedia.org' in current_website:
                        logger.info(f"    ⊘ Already has Wikipedia link: {current_website}")
                        stats['skipped'] += 1
                        total_processed += 1
                        continue

                    # Fetch Wikipedia link
                    time.sleep(RATE_LIMIT_DELAY)  # Rate limiting
                    wikipedia_url = search_wikipedia(temple_name, state_name, city_name)

                    if wikipedia_url:
                        old_website = temple.get('website', 'N/A')
                        temple['website'] = wikipedia_url
                        stats['updated'] += 1

                        logger.info(f"    Old website: {old_website}")
                        logger.info(f"    New website: {wikipedia_url}")
                    else:
                        stats['not_found'] += 1

                    total_processed += 1

                if demo_mode and total_processed >= demo_count:
                    break

            # Save updated data if not demo mode and not dry run
            if not demo_mode and not dry_run:
                with open(state_file, 'w', encoding='utf-8') as f:
                    json.dump(state_data, f, indent=2, ensure_ascii=False)
                logger.info(f"\n✓ Saved changes to {state_file}")
            elif dry_run:
                logger.info(f"\n[DRY RUN] Changes not saved to {state_file}")
            else:
                logger.info(f"\n[DEMO] Changes not saved to {state_file}")

        except FileNotFoundError:
            logger.error(f"State file not found: {state_file}")
            stats['errors'] += 1
        except Exception as e:
            logger.error(f"Error processing {state_file}: {e}")
            stats['errors'] += 1

    return stats


def print_summary(stats: Dict[str, int], demo_mode: bool = False):
    """Print processing summary."""
    logger.info(f"\n{'='*60}")
    logger.info("SUMMARY")
    logger.info(f"{'='*60}")
    logger.info(f"Total temples processed: {stats['total_temples']}")
    logger.info(f"✓ Wikipedia links found: {stats['updated']}")
    logger.info(f"✗ Not found on Wikipedia: {stats['not_found']}")
    logger.info(f"⊘ Already have Wikipedia link: {stats['skipped']}")
    logger.info(f"⚠ Errors: {stats['errors']}")

    if demo_mode:
        logger.info("\n[DEMO MODE] No files were modified")

    logger.info(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Fetch Wikipedia links for temples and update temple data files'
    )
    parser.add_argument('--state', type=str, help='Process specific state only')
    parser.add_argument('--demo', action='store_true', help='Run demo mode (no file updates)')
    parser.add_argument('--demo-count', type=int, default=5, help='Number of temples in demo (default: 5)')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without saving')

    args = parser.parse_args()

    logger.info("Starting Wikipedia link fetcher...")
    logger.info(f"Rate limit: {RATE_LIMIT_DELAY}s between requests")

    if args.demo:
        logger.info(f"Demo mode: Processing {args.demo_count} temples\n")

    # Process temples
    stats = process_temples(
        state=args.state,
        demo_mode=args.demo,
        demo_count=args.demo_count,
        dry_run=args.dry_run
    )

    # Print summary
    print_summary(stats, demo_mode=args.demo or args.dry_run)


if __name__ == "__main__":
    main()
