-- Migration to add explicit submission fields to the submissions table matching the updated frontend
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS members JSONB,
ADD COLUMN IF NOT EXISTS programming_languages TEXT,
ADD COLUMN IF NOT EXISTS problem_solved TEXT,
ADD COLUMN IF NOT EXISTS impact TEXT,
ADD COLUMN IF NOT EXISTS key_features TEXT,
ADD COLUMN IF NOT EXISTS challenges TEXT,
ADD COLUMN IF NOT EXISTS live_demo_url TEXT,
ADD COLUMN IF NOT EXISTS additional_links JSONB,
ADD COLUMN IF NOT EXISTS has_credentials BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS credentials TEXT;
