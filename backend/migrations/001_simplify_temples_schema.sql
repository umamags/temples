-- Migration: Simplify temples table schema
-- Keep only: id, location_id, name, deity, location_note
-- Move to JSON: year_constructed, website, image_url, festivals_and_events, source,
--               description, photo_urls, video_urls, lat, lon, updated_at

-- Drop unnecessary columns
ALTER TABLE temples
DROP COLUMN IF EXISTS year_constructed,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS festivals_and_events,
DROP COLUMN IF EXISTS source,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS photo_urls,
DROP COLUMN IF EXISTS video_urls,
DROP COLUMN IF EXISTS lat,
DROP COLUMN IF EXISTS lon,
DROP COLUMN IF EXISTS updated_at;

-- Verify final schema
-- Expected columns: id, location_id, name, deity, location_note, created_at (if exists)
DESC temples;
