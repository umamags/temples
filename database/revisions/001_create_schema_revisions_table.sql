-- Create schema revisions tracking table
-- This table tracks which database migrations have been applied

CREATE TABLE IF NOT EXISTS schema_revisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  revision_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert this revision itself
INSERT INTO schema_revisions (revision_name, description)
VALUES ('001_create_schema_revisions_table', 'Create tracking table for database revisions');
