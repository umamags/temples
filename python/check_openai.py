#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple OpenAI API test utility.
Tests basic connectivity and response handling with UTF-8 encoding.

Usage:
  OPENAI_API_KEY="sk-..." python check_openai.py
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

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("ERROR: OPENAI_API_KEY environment variable not set")
        sys.exit(1)

    print(f"Using API key: {api_key[:20]}...")
    print("Initializing OpenAI client...\n")

    try:
        # Import after setting UTF-8
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        print("✓ Client initialized successfully\n")

        print("Sending test prompt to OpenAI...")
        prompt = "What is the weather in Orlando?"
        print(f"  Prompt: {prompt}")
        print(f"  Prompt encoding: {prompt.encode('utf-8')}\n")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        print("✓ Response received successfully\n")
        print("=" * 60)
        print("RESPONSE:")
        print("=" * 60)
        print(response.choices[0].message.content)
        print("=" * 60)

    except Exception as e:
        import traceback
        print(f"✗ Error: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
