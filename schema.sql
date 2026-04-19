-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for Trespics Website

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);   

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email); 



-- Hackathon System Tables

-- Hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT,
  longDescription TEXT,
  objectives JSONB,
  rules TEXT,
  prizes JSONB,
  schedule JSONB,
  judges JSONB,
  sponsors JSONB,
  techStack JSONB,
  prize_pool_desc TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'Upcoming', -- Upcoming, Ongoing, Closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  created_by UUID, -- Can link to auth.users if needed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID, -- If individual submission
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- If team submission
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_link TEXT,
  video_link TEXT,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads (screenshots, etc.)
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for hackathon lookups
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_submissions_hackathon_id ON submissions(hackathon_id);
