#!/usr/bin/env python3
"""
Script to validate JSON files against CSV data.
Checks that each CSV row has a corresponding JSON file and vice versa.
"""

import csv
import os
from pathlib import Path

def main():
    csv_path = Path("data/csv/temples.csv")
    json_dir = Path("public/data/json")

    # Read CSV and extract IDs
    csv_ids = set()
    csv_rows = []

    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row_id = row['id'].strip()
                csv_ids.add(row_id)
                csv_rows.append(row)
    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_path}")
        return
    except KeyError:
        print("Error: CSV file does not have an 'id' column")
        return

    # Get JSON files
    json_files = set()
    try:
        json_files = {f.stem for f in json_dir.glob("*.json")}
    except FileNotFoundError:
        print(f"Error: JSON directory not found at {json_dir}")
        return

    # Find mismatches
    csv_no_json = []
    json_no_csv = []
    matched = 0

    for csv_id in csv_ids:
        if csv_id in json_files:
            matched += 1
        else:
            # Find the original row for context
            for row in csv_rows:
                if row['id'].strip() == csv_id:
                    csv_no_json.append((csv_id, row.get('name', 'N/A')))
                    break

    for json_id in json_files:
        if json_id not in csv_ids:
            json_no_csv.append(json_id)

    # Generate report
    print("\n" + "="*70)
    print("JSON DATA VALIDATION REPORT")
    print("="*70 + "\n")

    print(f"Total CSV rows:           {len(csv_ids)}")
    print(f"Total JSON files:         {len(json_files)}")
    print(f"Matched pairs:            {matched}")
    print(f"\nMismatch summary:")
    print(f"  CSV rows without JSON:  {len(csv_no_json)}")
    print(f"  JSON files without CSV: {len(json_no_csv)}")

    # CSV rows without JSON
    if csv_no_json:
        print("\n" + "-"*70)
        print("CSV ROWS WITHOUT MATCHING JSON:")
        print("-"*70)
        for csv_id, name in sorted(csv_no_json, key=lambda x: int(x[0])):
            print(f"  ID: {csv_id:6s} | Name: {name}")

    # JSON files without CSV
    if json_no_csv:
        print("\n" + "-"*70)
        print("JSON FILES WITHOUT MATCHING CSV ROW:")
        print("-"*70)
        def sort_key(x):
            try:
                return (0, int(x))
            except ValueError:
                return (1, x)

        for json_id in sorted(json_no_csv, key=sort_key):
            print(f"  ID: {json_id}")

    if not csv_no_json and not json_no_csv:
        print("\n✓ All data validated successfully - perfect match!")

    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
