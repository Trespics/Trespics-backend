-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Seed some university data
INSERT INTO universities (name) VALUES 
('University of Nairobi'),
('Kenyatta University'),
('Moi University'),
('Egerton University'),
('Jomo Kenyatta University of Agriculture and Technology'),
('Maseno University'),
('Masinde Muliro University of Science and Technology'),
('Dedan Kimathi University of Technology'),
('Technical University of Kenya'),
('Technical University of Mombasa'),
('Pwani University'),
('Karatina University'),
('Chuka University'),
('Kisii University'),
('Meru University of Science and Technology'),
('Multimedia University of Kenya'),
('South Eastern Kenya University'),
('University of Eldoret'),
('Maasai Mara University'),
('Laikipia University'),
('Machakos University'),
('Murang’a University of Technology'),
('Kirinyaga University'),
('Taita Taveta University'),
('Turkana University College'),
('Garissa University'),
('Kaimosi Friends University'),
('Rongo University'),
('Co-operative University of Kenya'),

-- Private Universities
('Strathmore University'),
('United States International University Africa'),
('Daystar University'),
('Mount Kenya University'),
('Africa Nazarene University'),
('Kenya Methodist University'),
('Catholic University of Eastern Africa'),
('Pan Africa Christian University'),
('Kabarak University'),
('Scott Christian University'),
('St. Paul’s University'),
('Adventist University of Africa'),
('Great Lakes University of Kisumu'),
('Zetech University'),
('Umma University'),
('Riara University'),
('Amref International University'),
('Presbyterian University of East Africa'),
('Management University of Africa'),
('International Leadership University'),
('Marist International University College'),
('Tangaza University')
ON CONFLICT (name) DO NOTHING;

-- Create hackathon_registrations table
CREATE TABLE IF NOT EXISTS hackathon_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID, -- Optional, can be null if not using auth yet
  leader_name TEXT NOT NULL,
  university_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hackathon_id, user_id), -- Prevent duplicate registration per user
  UNIQUE(hackathon_id, leader_name, project_name) -- Prevent duplicate project/leader combo
);

-- Index for status checks
CREATE INDEX IF NOT EXISTS idx_registrations_hackathon_user ON hackathon_registrations(hackathon_id, user_id);
