#!/usr/bin/env python3
"""
One-time migration: loads the temples app's existing JSON data
(public/data/temples/*.json and public/data/temples2/*.json)
into the MySQL schema created by schema_mysql.sql.

Usage:
    pip install mysql-connector-python --break-system-packages
    export MYSQL_HOST=localhost
    export MYSQL_USER=temples_app
    export MYSQL_PASSWORD=CHANGE_ME_BEFORE_RUNNING
    export MYSQL_DATABASE=temples

    python3 migrate_mysql.py /path/to/temples/public/data

Safe to re-run: uses ON DUPLICATE KEY UPDATE rather than duplicating rows.

Note on GoDaddy: run this against your LOCAL MySQL first to verify the data
loads cleanly. To point it at GoDaddy afterward, set MYSQL_HOST to your
domain/IP and use the cPanel-generated database/username (GoDaddy prefixes
both with your cPanel account name) — and make sure "Remote MySQL" access is
enabled in cPanel for your Mac's IP, since shared hosting blocks external
connections by default.
"""

import json
import os
import re
import sys
from pathlib import Path

import mysql.connector


def slugify(text: str) -> str:
    """Mirrors src/utils/slug.js so slugs match what the frontend expects."""
    text = text.lower().strip()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^\w-]+", "", text)
    text = re.sub(r"--+", "-", text)
    return text


def upsert_state(cur, name, last_synced=None):
    """Insert or find a state row, returning its id either way."""
    cur.execute(
        """
        INSERT INTO states (name, slug, last_synced)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            last_synced = COALESCE(VALUES(last_synced), last_synced)
        """,
        (name, slugify(name), last_synced),
    )
    return cur.lastrowid


def upsert_location(cur, state_id, name, kind="city", lat=None, lon=None):
    """Insert or find a location row, returning its id either way."""
    cur.execute(
        """
        INSERT INTO locations (state_id, name, slug, kind, lat, lon)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            kind = VALUES(kind),
            lat = VALUES(lat),
            lon = VALUES(lon)
        """,
        (state_id, name, slugify(name), kind, lat, lon),
    )
    return cur.lastrowid


def load_detailed_temples(conn, data_dir: Path):
    """public/data/temples/*.json — per-state, per-city detailed records."""
    temples_dir = data_dir / "temples"
    cur = conn.cursor()

    for path in sorted(temples_dir.glob("*.json")):
        if path.name == "index.json":
            continue

        doc = json.loads(path.read_text())
        state_name = doc["state"]
        last_updated = doc.get("last_updated")

        state_id = upsert_state(cur, state_name, last_updated)

        for city_name, temples in doc.get("cities", {}).items():
            location_id = upsert_location(cur, state_id, city_name, kind="city")

            rows = [
                (
                    location_id,
                    t["name"],
                    t.get("main_deity"),
                    t.get("image_url"),
                    t.get("website"),
                    t.get("year_constructed"),
                    json.dumps(t.get("festivals_and_events") or []),
                    "detailed",
                )
                for t in temples
            ]
            if rows:
                cur.executemany(
                    """
                    INSERT INTO temples
                        (location_id, name, deity, image_url, website,
                         year_constructed, festivals_and_events, source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        deity = VALUES(deity),
                        image_url = VALUES(image_url),
                        website = VALUES(website),
                        year_constructed = VALUES(year_constructed),
                        festivals_and_events = VALUES(festivals_and_events),
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    rows,
                )

        conn.commit()
        print(f"  loaded detailed temples for {state_name}")


def load_top_pick_temples(conn, data_dir: Path):
    """public/data/temples2/*.json — per-town 'top 5' picks with lat/lon."""
    temples2_dir = data_dir / "temples2"
    cur = conn.cursor()

    for path in sorted(temples2_dir.glob("*.json")):
        entries = json.loads(path.read_text())

        for entry in entries:
            state_name = entry["state"]
            town_name = entry["town"]
            kind = entry.get("type", "town")
            lat, lon = entry.get("lat"), entry.get("lon")

            state_id = upsert_state(cur, state_name)
            location_id = upsert_location(cur, state_id, town_name, kind, lat, lon)

            rows = [
                (
                    location_id,
                    t["name"],
                    t.get("deity"),
                    t.get("location_note"),
                    "top_pick",
                )
                for t in entry.get("top_temples", [])
            ]
            if rows:
                cur.executemany(
                    """
                    INSERT INTO temples
                        (location_id, name, deity, location_note, source)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        deity = VALUES(deity),
                        location_note = VALUES(location_note),
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    rows,
                )

        conn.commit()
        print(f"  loaded top-pick temples from {path.name}")


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    data_dir = Path(sys.argv[1])

    required = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        print(f"Set these environment variables first: {', '.join(missing)}")
        sys.exit(1)

    conn = mysql.connector.connect(
        host=os.environ["MYSQL_HOST"],
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DATABASE"],
    )
    try:
        print("Loading detailed temples (public/data/temples)...")
        load_detailed_temples(conn, data_dir)

        print("Loading top-pick temples (public/data/temples2)...")
        load_top_pick_temples(conn, data_dir)
    finally:
        conn.close()

    print("Done.")


if __name__ == "__main__":
    main()
