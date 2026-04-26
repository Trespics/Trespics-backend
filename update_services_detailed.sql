-- Update Services Table with detailed information
ALTER TABLE services ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS extra_images JSONB DEFAULT '[]'::jsonb;
