-- This script will be executed when the database container is first created.
-- It sets up the initial schema for the application.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   username VARCHAR(255) NOT NULL UNIQUE,
   password_hash VARCHAR(255) NOT NULL,
   reputation INT NOT NULL DEFAULT 0,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
--  content     TEXT         NOT NULL,
    professor_names   TEXT[],
    course_names      TEXT[],
    tags        TEXT[]       NOT NULL DEFAULT '{}',
    is_public   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
    file_path   VARCHAR(255) NOT NULL,
    uploader_id UUID         NOT NULL REFERENCES users (id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Testing
INSERT INTO users (username, password_hash) VALUES ('testuser', 'somehash');
