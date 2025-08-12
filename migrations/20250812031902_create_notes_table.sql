-- Add migration script here
DROP TABLE IF EXISTS notes;

CREATE TABLE IF NOT EXISTS notes (
                                     id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    professor_names   TEXT[],
    course_names      TEXT[],
    tags        TEXT[]       NOT NULL DEFAULT '{}',
    is_public   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
    file_path   VARCHAR(255) NOT NULL,
    uploader_id UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
