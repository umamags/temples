#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple Google Gemini API test utility.
Tests basic connectivity and response handling with UTF-8 encoding.

Usage:
  GEMINI_API_KEY="your-api-key" python check_gemini.py

Install gemini package:
  pip install google-generativeai
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

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set")
        sys.exit(1)

    print(f"Using API key: {api_key[:20]}...")
    print("Initializing Gemini client...\n")

    try:
        # Import after setting UTF-8
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        print("✓ Client initialized successfully\n")

        print("Sending test prompt to Google Gemini...")
        prompt = "What is the capital of France?"
        print(f"  Prompt: {prompt}\n")

        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)

        print("✓ Response received successfully\n")
        print("=" * 60)
        print("RESPONSE:")
        print("=" * 60)
        print(response.text)
        print("=" * 60)

    except ImportError:
        print("✗ Error: google-generativeai package not installed")
        print("Install it with: pip install google-generativeai")
        sys.exit(1)
    except Exception as e:
        import traceback
        print(f"✗ Error: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
