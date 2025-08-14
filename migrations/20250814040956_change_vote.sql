DROP TABLE votes;
CREATE TABLE votes (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                       is_upvote BOOLEAN NOT NULL,
                       created_at TIMESTAMPTZ DEFAULT NOW(),
                       UNIQUE(user_id, note_id)
);