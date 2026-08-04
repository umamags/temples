#!/usr/bin/env python3
"""
Generate mock Google search results for temples.
Creates placeholder results stored as JSON files for use in the frontend.
"""

import json
import os
from pathlib import Path


def slugify(text):
    """Convert text to URL-safe slug."""
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def generate_mock_google_results(temple_name, state, city):
    """Generate 3 mock Google search results for a temple."""
    search_query = f"{temple_name} {state} {city}"

    results = [
        {
            "title": f"{temple_name} - {city}, {state} | [PLACEHOLDER]",
            "url": f"https://example.com/temple/{slugify(temple_name)}",
            "description": f"Information about {temple_name} located in {city}, {state}. Learn about the temple's history, architecture, and visiting details. [PLACEHOLDER RESULT]"
        },
        {
            "title": f"{temple_name} Wikipedia | [PLACEHOLDER]",
            "url": f"https://example.com/wiki/{slugify(temple_name)}",
            "description": f"Wikipedia article about {temple_name}. Comprehensive information including historical background, religious significance, and visitor information for {city}. [PLACEHOLDER RESULT]"
        },
        {
            "title": f"Visit {temple_name} in {city} - Travel Guide | [PLACEHOLDER]",
            "url": f"https://example.com/travel/{slugify(city)}/{slugify(temple_name)}",
            "description": f"Complete travel guide to {temple_name} in {city}, {state}. Includes location, opening hours, entry fees, and nearby attractions. [PLACEHOLDER RESULT]"
        }
    ]

    return results


def generate_all_results():
    """Generate Google results for all temples in the data files."""
    temples_data_dir = Path(__file__).parent.parent / "public" / "data" / "temples"
    output_dir = Path(__file__).parent.parent / "public" / "data" / "google-results"

    if not temples_data_dir.exists():
        print(f"Error: Temples data directory not found: {temples_data_dir}")
        return

    output_dir.mkdir(parents=True, exist_ok=True)
    total_results = 0

    # Iterate through all state JSON files
    for state_file in sorted(temples_data_dir.glob("*.json")):
        state_name = state_file.stem  # filename without .json

        try:
            with open(state_file, 'r', encoding='utf-8') as f:
                state_data = json.load(f)

            # Process each city
            for city_name, temples in state_data.get("cities", {}).items():
                city_slug = slugify(city_name)
                state_slug = slugify(state_name)

                # Create city directory
                city_dir = output_dir / state_slug / city_slug
                city_dir.mkdir(parents=True, exist_ok=True)

                # Generate results for each temple
                for temple in temples:
                    temple_name = temple.get("name", "Unknown Temple")
                    temple_slug = slugify(temple_name)

                    results = generate_mock_google_results(temple_name, state_name, city_name)

                    # Save to JSON file
                    output_file = city_dir / f"{temple_slug}.json"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump({"results": results}, f, indent=2, ensure_ascii=False)

                    total_results += 1

        except json.JSONDecodeError as e:
            print(f"Error parsing {state_file}: {e}")
        except Exception as e:
            print(f"Error processing {state_file}: {e}")

    print(f"✓ Generated mock Google results for {total_results} temples")
    print(f"✓ Results saved to: {output_dir}")


if __name__ == "__main__":
    generate_all_results()
