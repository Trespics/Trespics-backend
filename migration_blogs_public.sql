-- Migration: Make blogs public and add author_email
-- Update blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE blogs ALTER COLUMN author_id DROP NOT NULL;

-- Update blog_likes table to allow anonymous likes (user_id is null)
ALTER TABLE blog_likes ALTER COLUMN user_id DROP NOT NULL;
-- Drop the unique constraint if it requires user_id
-- We can't really have a unique constraint for anonymous likes without IP or session ID
-- but for simplicity we'll just allow them.

-- Update blog_saves table to allow anonymous saves
ALTER TABLE blog_saves ALTER COLUMN user_id DROP NOT NULL;

-- Add comment to track this change
COMMENT ON TABLE blogs IS 'Public blogs table where anyone can submit blogs for approval.';
