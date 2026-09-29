ALTER TABLE temples ADD COLUMN lat DECIMAL(10, 8) DEFAULT NULL AFTER location_id;
ALTER TABLE temples ADD COLUMN lon DECIMAL(11, 8) DEFAULT NULL AFTER lat;
CREATE INDEX idx_temples_location ON temples(lat, lon);
