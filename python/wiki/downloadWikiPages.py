#!/usr/bin/env python3
"""
Download Wikipedia pages and extract image URLs.

Reads page links from a CSV file and downloads HTML pages.
Extracts image URLs and saves them to image_download.csv.
Handles duplicates by stripping URL fragments.
"""

import csv
import sys
import argparse
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Required packages not found.")
    print("Please install them using: pip install requests beautifulsoup4")
    sys.exit(1)


class WikiPageDownloader:
    """Download Wikipedia pages and extract images."""

    def __init__(self, output_dir='data/wikipages'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.downloaded_urls = set()
        self.image_urls = []  # List of (page_url, image_url) tuples
        self.errors = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    @staticmethod
    def normalize_url(url):
        """Remove fragment from URL (everything after #)."""
        parsed = urlparse(url)
        # Remove fragment
        normalized = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            ''  # fragment removed
        ))
        return normalized

    @staticmethod
    def get_page_name(url):
        """Extract page name from URL for directory."""
        parsed = urlparse(url)
        path = parsed.path.strip('/')
        # Get last part of path (e.g., "List_of_Hindu_temples_in_India")
        page_name = path.split('/')[-1] if '/' in path else path
        return page_name if page_name else 'index'

    def fetch_page(self, url):
        """Fetch webpage and return BeautifulSoup object."""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser'), response
        except requests.RequestException as e:
            error_msg = f"Error fetching {url}: {e}"
            print(f"  ✗ {error_msg}")
            self.errors.append({
                'url': url,
                'error': str(e),
            })
            return None, None

    def extract_image_urls(self, soup, base_url, page_url):
        """Extract image URLs from webpage and store them."""
        for img in soup.find_all('img'):
            src = img.get('src', '').strip()
            if src:
                # Convert relative URLs to absolute
                absolute_url = urljoin(base_url, src)
                self.image_urls.append({
                    'page_url': page_url,
                    'image_url': absolute_url
                })

    def is_file_page(self, url):
        """Check if URL is a Wikimedia file/image page."""
        return '/wiki/File:' in url or '/wiki/Image:' in url

    def extract_full_image_url(self, thumbnail_url):
        """Convert thumbnail URL to full-resolution image URL.

        Thumbnail: //upload.wikimedia.org/wikipedia/commons/thumb/a/b/File.jpg/1000px-File.jpg
        Full-res:  //upload.wikimedia.org/wikipedia/commons/a/b/File.jpg
        """
        try:
            # Remove query parameters
            if '?' in thumbnail_url:
                thumbnail_url = thumbnail_url.split('?')[0]

            # Check if this is a thumbnail URL (contains /thumb/)
            if '/thumb/' not in thumbnail_url:
                return thumbnail_url

            # Parse the URL to extract the directory and filename
            parts = thumbnail_url.split('/')

            # Find the position of 'thumb'
            if 'thumb' in parts:
                thumb_idx = parts.index('thumb')

                # Reconstruct URL without the /thumb/ part and size prefix
                before_thumb = parts[:thumb_idx]
                after_thumb = parts[thumb_idx + 1:]

                # Keep the parts before the sized version
                if len(after_thumb) > 1:
                    filename_parts = after_thumb[:-1]
                    full_url = '/'.join(before_thumb + filename_parts)
                    # Ensure protocol
                    if not full_url.startswith('http'):
                        full_url = 'https:' + full_url
                    return full_url

            return thumbnail_url
        except Exception:
            return thumbnail_url

    def extract_file_url(self, soup, page_url):
        """Extract the actual image file URL from a file description page."""
        try:
            # Extract the filename from the page URL
            page_filename = page_url.split('/wiki/File:')[-1] if '/wiki/File:' in page_url else ''

            # First, try to find the main file image by alt text matching
            for img in soup.find_all('img'):
                alt = img.get('alt', '').strip()
                src = img.get('src', '').strip()

                # Check if this is the main file image by matching filename
                if page_filename and ('File:' in alt or page_filename.split(',')[0] in alt):
                    if 'upload.wikimedia.org' in src:
                        abs_url = urljoin(page_url, src)
                        full_url = self.extract_full_image_url(abs_url)
                        if full_url:
                            return full_url

            # Fallback: look for the largest image (by data-file-width attribute)
            largest_img = None
            max_width = 0
            for img in soup.find_all('img'):
                src = img.get('src', '').strip()
                if 'upload.wikimedia.org' in src and 'commons' in src:
                    width = img.get('data-file-width')
                    if width:
                        try:
                            width = int(width)
                            if width > max_width:
                                max_width = width
                                largest_img = img
                        except ValueError:
                            pass

            if largest_img:
                src = largest_img.get('src', '').strip()
                if src:
                    abs_url = urljoin(page_url, src)
                    full_url = self.extract_full_image_url(abs_url)
                    if full_url:
                        return full_url

            # Final fallback: look for links to the original file
            for link in soup.find_all('a', href=True):
                href = link.get('href', '')
                if 'upload.wikimedia.org' in href and '/thumb/' not in href:
                    return urljoin(page_url, href)

            return None
        except Exception:
            return None

    def process_file_page(self, url, soup, response):
        """Handle file/image pages."""
        print(f"    📄 File page detected")

        # Get page name
        page_name = self.get_page_name(url)
        page_dir = self.output_dir / page_name
        page_dir.mkdir(parents=True, exist_ok=True)

        # Save HTML
        html_file = page_dir / 'page.html'
        try:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"    ✓ Saved file description: {html_file.relative_to(self.output_dir.parent)}")
        except Exception as e:
            print(f"    ✗ Error saving HTML: {e}")
            return False

        # Extract the actual image file URL
        file_url = self.extract_file_url(soup, response.url)
        if file_url:
            self.image_urls.append({
                'page_url': url,
                'image_url': file_url
            })
            print(f"    ✓ Found image URL: {file_url}")
        else:
            print(f"    ⚠ Could not extract file URL from page")

        return True

    def download_page(self, url):
        """Download a page HTML and extract image URLs."""
        # Normalize URL (remove fragments)
        normalized_url = self.normalize_url(url)

        # Check if already downloaded
        if normalized_url in self.downloaded_urls:
            print(f"  ⊘ Already downloaded: {normalized_url}")
            return True

        print(f"  ↓ Downloading: {normalized_url}")

        # Fetch page
        soup, response = self.fetch_page(url)
        if soup is None:
            return False

        # Check if this is a file/image page
        if self.is_file_page(url):
            success = self.process_file_page(url, soup, response)
            if success:
                self.downloaded_urls.add(normalized_url)
            return success

        # Regular article page - create directory
        page_name = self.get_page_name(normalized_url)
        page_dir = self.output_dir / page_name
        page_dir.mkdir(parents=True, exist_ok=True)

        # Save HTML
        html_file = page_dir / 'page.html'
        try:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"    ✓ Saved HTML: {html_file.relative_to(self.output_dir.parent)}")
        except Exception as e:
            error_msg = f"Error saving HTML: {e}"
            print(f"    ✗ {error_msg}")
            self.errors.append({
                'url': url,
                'error': error_msg,
            })
            return False

        # Extract image URLs from article
        self.extract_image_urls(soup, response.url, url)
        if self.image_urls:
            # Count images found for this page
            page_images = [img for img in self.image_urls if img['page_url'] == url]
            if page_images:
                print(f"    Found {len(page_images)} images")

        # Mark as downloaded
        self.downloaded_urls.add(normalized_url)

        return True

    def save_image_urls_to_csv(self):
        """Save extracted image URLs to CSV file."""
        if not self.image_urls:
            print("No images found to save.")
            return

        csv_file = self.output_dir / 'image_download.csv'
        try:
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=['page_url', 'image_url'])
                writer.writeheader()
                writer.writerows(self.image_urls)

            print(f"✓ Saved {len(self.image_urls)} image URLs to {csv_file.relative_to(self.output_dir.parent)}")
        except Exception as e:
            print(f"Error saving image CSV: {e}")

    def process_csv(self, csv_file):
        """Process all URLs from CSV file."""
        csv_path = Path(csv_file)

        if not csv_path.exists():
            print(f"Error: CSV file not found: {csv_file}")
            sys.exit(1)

        print(f"Reading URLs from: {csv_file}")

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                urls = []

                for row in reader:
                    if row:
                        # Try to get URL from various possible column names
                        url = (row.get('absolute_url') or
                               row.get('url') or
                               row.get('href'))

                        if url:
                            urls.append(url.strip())

                if not urls:
                    print("Error: No URLs found in CSV")
                    sys.exit(1)

                print(f"Found {len(urls)} URLs")
                print()

                # Process each URL
                for i, url in enumerate(urls, 1):
                    print(f"[{i}/{len(urls)}] Processing: {url}")
                    self.download_page(url)
                    print()

        except Exception as e:
            print(f"Error reading CSV: {e}")
            sys.exit(1)

        # Print summary and save image URLs
        self.print_summary()

    def print_summary(self):
        """Print download summary."""
        print("=" * 80)
        print("DOWNLOAD SUMMARY")
        print("=" * 80)
        print(f"Pages downloaded: {len(self.downloaded_urls)}")
        print(f"Images found: {len(self.image_urls)}")
        print(f"Errors encountered: {len(self.errors)}")
        print()

        if self.errors:
            print("ERRORS:")
            for error in self.errors[-10:]:  # Show last 10 errors
                print(f"  • {error['url']}")
                print(f"    {error['error']}")
            if len(self.errors) > 10:
                print(f"  ... and {len(self.errors) - 10} more errors")
            print()

        # Save image URLs to CSV
        self.save_image_urls_to_csv()
        print(f"Pages saved to: {self.output_dir.relative_to(self.output_dir.parent)}")


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Download Wikipedia pages and extract image URLs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python3 downloadWikiPages.py a.csv
  python3 downloadWikiPages.py links.csv --output ~/data/wikipages
        '''
    )
    parser.add_argument('csv_file', help='CSV file with page links')
    parser.add_argument('--output', default='data/wikipages', help='Output directory (default: data/wikipages)')

    args = parser.parse_args()

    downloader = WikiPageDownloader(output_dir=args.output)
    downloader.process_csv(args.csv_file)


if __name__ == '__main__':
    main()
