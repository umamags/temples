#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple Anthropic Claude API test utility.
Tests basic connectivity and response handling with UTF-8 encoding.

Usage:
  ANTHROPIC_API_KEY="your-api-key" python check_anthropic.py

Install anthropic package:
  pip install anthropic
"""

import os
import sys
import locale

def main():
    # Ensure UTF-8 encoding for stdout and stderr
    if sys.stdout.encoding != 'utf-8':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        import io
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    print("Environment Info:")
    print(f"  Default encoding: {sys.getdefaultencoding()}")
    print(f"  Filesystem encoding: {sys.getfilesystemencoding()}")
    print(f"  Stdout encoding: {sys.stdout.encoding}")
    print(f"  Locale: {locale.getlocale()}\n")

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    print(f"Using API key: {api_key[:20]}...")
    print("Initializing Anthropic client...\n")

    try:
        # Import after setting UTF-8
        from anthropic import Anthropic

        client = Anthropic(api_key=api_key)
        print("✓ Client initialized successfully\n")

        print("Sending test prompt to Anthropic Claude...")
        prompt = "What is the capital of United States?"
        print(f"  Prompt: {prompt}\n")

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        print("✓ Response received successfully\n")
        print("=" * 60)
        print("RESPONSE:")
        print("=" * 60)
        print(message.content[0].text)
        print("=" * 60)

    except ImportError:
        print("✗ Error: anthropic package not installed")
        print("Install it with: pip install anthropic")
        sys.exit(1)
    except Exception as e:
        import traceback
        print(f"✗ Error: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
