#!/usr/bin/env python3
"""
Fetch all links from a Wikipedia page and store them in a CSV file.

Reads URLs from a.csv and extracts all links from the webpage.
Writes the extracted links to links.csv in the same directory.
"""

import csv
import os
import sys
from urllib.parse import urljoin, urlparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Required packages not found.")
    print("Please install them using: pip install requests beautifulsoup4")
    sys.exit(1)


def read_urls_from_csv(csv_file):
    """Read URLs from CSV file."""
    urls = []
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row and 'url' in row:
                    url = row['url'].strip()
                    if url:
                        urls.append(url)
    except FileNotFoundError:
        print(f"Error: File {csv_file} not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        sys.exit(1)

    return urls


def fetch_page(url):
    """Fetch webpage and return BeautifulSoup object."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None


def extract_links(soup, base_url):
    """Extract all links from BeautifulSoup object."""
    links = []

    if soup is None:
        return links

    for link in soup.find_all('a', href=True):
        href = link.get('href', '').strip()
        text = link.get_text(strip=True)

        if href:
            # Convert relative URLs to absolute URLs
            absolute_url = urljoin(base_url, href)

            links.append({
                'text': text,
                'href': href,
                'absolute_url': absolute_url,
                'domain': urlparse(absolute_url).netloc
            })

    return links


def write_links_to_csv(links, output_file):
    """Write links to CSV file."""
    if not links:
        print("No links found.")
        return

    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['text', 'href', 'absolute_url', 'domain']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(links)

        print(f"Successfully wrote {len(links)} links to {output_file}")
    except Exception as e:
        print(f"Error writing CSV: {e}")
        sys.exit(1)


def main():
    """Main function."""
    # Get script directory
    script_dir = Path(__file__).parent
    input_csv = script_dir / 'a.csv'
    output_csv = script_dir / 'links.csv'

    print(f"Script directory: {script_dir}")
    print(f"Input file: {input_csv}")
    print(f"Output file: {output_csv}")
    print()

    # Read URLs from CSV
    urls = read_urls_from_csv(input_csv)

    if not urls:
        print("Error: No URLs found in a.csv")
        sys.exit(1)

    all_links = []

    # Process each URL
    for url in urls:
        print(f"Fetching: {url}")
        soup = fetch_page(url)

        if soup:
            links = extract_links(soup, url)
            all_links.extend(links)
            print(f"  Found {len(links)} links")
        else:
            print(f"  Failed to fetch")

    print()

    # Write to output CSV
    if all_links:
        write_links_to_csv(all_links, output_csv)
    else:
        print("No links to write.")


if __name__ == '__main__':
    main()
