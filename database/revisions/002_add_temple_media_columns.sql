-- Add media and tracking columns to temples table
-- Supports photos, videos, and descriptions for temples

ALTER TABLE temples
ADD COLUMN IF NOT EXISTS photo_urls JSON DEFAULT NULL COMMENT 'Array of photo file paths: ["/data/temples/photos/temple_1/photo1.jpg", ...]',
ADD COLUMN IF NOT EXISTS video_urls JSON DEFAULT NULL COMMENT 'Array of video file paths: ["/data/temples/videos/temple_1/video1.mp4", ...]',
ADD COLUMN IF NOT EXISTS description LONGTEXT DEFAULT NULL COMMENT 'Full description of the temple',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when temple was last updated';

-- Track this revision
INSERT INTO schema_revisions (revision_name, description)
VALUES ('002_add_temple_media_columns', 'Add photo_urls, video_urls, description, and updated_at columns to temples table');
