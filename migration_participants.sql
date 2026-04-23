-- Migration: Add Participants and Update Registrations

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  university TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email column to hackathon_registrations if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_attribute 
                 WHERE  attrelid = 'hackathon_registrations'::regclass 
                 AND    attname = 'email') THEN
    ALTER TABLE hackathon_registrations ADD COLUMN email TEXT;
  END IF;
END $$;

-- Update existing registrations to have a placeholder email if necessary (optional)
-- UPDATE hackathon_registrations SET email = 'placeholder_' || id || '@example.com' WHERE email IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON hackathon_registrations(email);
