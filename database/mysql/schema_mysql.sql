-- ============================================================================
-- Temples App — MySQL schema (GoDaddy-compatible)
-- Ported from the PostgreSQL schema.sql, adjusted for GoDaddy's actual
-- shared-hosting MySQL versions (5.6.49 / 5.7.38, or MariaDB 10.6 as their
-- more modern alternative). Written to run cleanly on ALL of those —
-- deliberately avoids features that only exist in MySQL 8.0.16+
-- (CHECK constraints are not enforced pre-8.0.16, and BLOB/TEXT/JSON columns
-- can't take a non-NULL DEFAULT before 8.0.13), so nothing here silently
-- behaves differently between your Mac and GoDaddy.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1 (local Mac dev only): create the database and app user.
-- On GoDaddy itself, you will NOT run this block — cPanel's "MySQL Database
-- Wizard" creates the database and user for you (and prefixes both names
-- with your cPanel account name, e.g. "youraccount_temples"). See the notes
-- at the bottom of this file for the GoDaddy-side steps.
-- ----------------------------------------------------------------------------

-- CREATE DATABASE IF NOT EXISTS temples
--     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CREATE USER IF NOT EXISTS 'temples_app'@'localhost' IDENTIFIED BY 'Admin001!';
-- GRANT ALL PRIVILEGES ON temples.* TO 'temples_app'@'localhost';
-- FLUSH PRIVILEGES;

USE temples;

-- ----------------------------------------------------------------------------
-- STEP 2: Core reference tables
-- ----------------------------------------------------------------------------

CREATE TABLE states (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    slug          VARCHAR(100) NOT NULL,
    total_temples INT,
    city_count    INT,
    last_synced   DATETIME,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_states_name (name),
    UNIQUE KEY uq_states_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unifies "city" (from temples/) and "town"/"temple town" (from temples2/).
-- 'kind' has no CHECK constraint (unreliable before MySQL 8.0.16) — validate
-- the allowed values ('city', 'town', 'temple town') in migrate_mysql.py instead.
CREATE TABLE locations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    state_id    INT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL,
    kind        VARCHAR(20) NOT NULL DEFAULT 'city',
    lat         DECIMAL(9,6),
    lon         DECIMAL(9,6),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_locations_state_name (state_id, name),
    KEY idx_locations_state_id (state_id),
    CONSTRAINT fk_locations_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- STEP 3: Temples
-- festivals_and_events is JSON (supported since MySQL 5.7.8 / MariaDB 10.2,
-- though MariaDB stores it as LONGTEXT with a validity check under the hood —
-- functionally fine either way). No DEFAULT on it: pre-8.0.13 MySQL rejects
-- a non-NULL default on JSON/TEXT/BLOB columns, so migrate_mysql.py always
-- writes an explicit JSON array (even '[]'), never leaves it to a default.
-- ----------------------------------------------------------------------------

CREATE TABLE temples (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    location_id           INT NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    deity                 VARCHAR(255),
    image_url             VARCHAR(500),
    website               VARCHAR(500),
    year_constructed      INT,
    location_note         VARCHAR(500),
    festivals_and_events  JSON,
    source                VARCHAR(20) NOT NULL DEFAULT 'detailed',
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_temples_location_name_source (location_id, name, source),
    KEY idx_temples_location_id (location_id),
    FULLTEXT KEY ft_temples_name (name),
    CONSTRAINT fk_temples_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- FULLTEXT on InnoDB needs MySQL 5.6.4+ / any MariaDB 10.6 — both of
-- GoDaddy's options qualify. Search with:
--   SELECT * FROM temples WHERE MATCH(name) AGAINST ('padmanabha' IN NATURAL LANGUAGE MODE);

-- Optional: per-image metadata. Skip for now if the existing PHP
-- listfiles.php approach for the image gallery is working fine.
CREATE TABLE temple_images (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    temple_id     INT NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    full_url      VARCHAR(500) NOT NULL,
    description   TEXT,
    size_bytes    BIGINT,
    modified_at   DATETIME,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_temple_images_temple_id (temple_id),
    CONSTRAINT fk_temple_images_temple FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- STEP 4: Users & visited-temples tracking
-- Replaces the localStorage-only 'temples:username' / 'temples:visited'
-- behavior in useUsername.js / useVisitedTemples.js.
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE visited_temples (
    user_id     INT NOT NULL,
    temple_id   INT NOT NULL,
    visited_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, temple_id),
    CONSTRAINT fk_visited_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_visited_temple FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GODADDY DEPLOYMENT NOTES (read before pushing this schema live)
-- ============================================================================
-- 1. GoDaddy shared cPanel hosting does not give you a raw CREATE DATABASE /
--    CREATE USER connection — you create both through cPanel's "MySQL
--    Database Wizard", which auto-prefixes them with your cPanel account
--    name, e.g. database "yourcpanelname_temples" and user
--    "yourcpanelname_templesapp". You then attach the user to the database
--    and pick privileges from a checklist, all in the cPanel UI.
-- 2. Once that database exists, open phpMyAdmin from cPanel, select it, use
--    the "Import" tab, and upload everything in this file FROM THE "USE
--    temples;" LINE DOWN (skip the CREATE DATABASE/CREATE USER/GRANT lines
--    above — cPanel already did that part, under different names).
-- 3. Update your app/API layer's connection details to the cPanel-generated
--    database name, username, and password rather than "temples"/"temples_app".
-- 4. Confirm which engine GoDaddy gave you (5.6.49, 5.7.38, or MariaDB 10.6)
--    via phpMyAdmin's home page before importing — this file was written to
--    work on all three, but it's worth confirming JSON/FULLTEXT behave as
--    expected on whichever one you land on.
