ALTER TABLE users
DROP COLUMN picture;

ALTER TABLE users
ADD COLUMN picture TEXT NOT NULL DEFAULT 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';