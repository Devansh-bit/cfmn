
CREATE EXTENSION "pgcrypto";

CREATE TABLE users (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     google_id VARCHAR(255) NOT NULL UNIQUE,
                                     email VARCHAR(255) NOT NULL UNIQUE,
                                     full_name VARCHAR(255) NOT NULL,
                                     reputation INT NOT NULL DEFAULT 0,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
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
CREATE TABLE votes (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                       vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       UNIQUE(user_id, note_id)
);
