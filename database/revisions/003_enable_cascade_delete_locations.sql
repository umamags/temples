-- Enable cascade delete for location foreign key
-- When a location is deleted, all temples in that location are automatically deleted

-- Drop existing foreign key (if it exists without cascade)
ALTER TABLE temples DROP FOREIGN KEY IF EXISTS temples_ibfk_1;

-- Add foreign key with ON DELETE CASCADE
ALTER TABLE temples
ADD CONSTRAINT temples_ibfk_1
FOREIGN KEY (location_id) REFERENCES locations(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Track this revision
INSERT INTO schema_revisions (revision_name, description)
VALUES ('003_enable_cascade_delete_locations', 'Enable cascade delete on temples.location_id foreign key');
