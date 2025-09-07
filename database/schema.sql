-- VGBF Database Schema
-- Creating tables for the archery federation website

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(255),
    established VARCHAR(50),
    activities TEXT[], -- Array of activities
    facilities TEXT[], -- Array of facilities
    training_times JSONB, -- Store training schedule as JSON
    member_count INTEGER,
    membership_fee VARCHAR(100),
    welcomes_new_members BOOLEAN DEFAULT true,
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    image_url VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    archery_types TEXT[], -- Array of archery types
    achievements TEXT[], -- Array of achievements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(255) PRIMARY KEY, -- Use string ID to match existing data
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    date DATE NOT NULL,
    featured BOOLEAN DEFAULT false,
    image_url VARCHAR(255),
    image_alt VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT true,
    tags JSONB -- Store tags as JSON for consistency
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    end_date DATE,
    location VARCHAR(255),
    registration_deadline DATE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    category VARCHAR(100), -- outdoor, indoor, 3d, field, other
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    registration_url VARCHAR(255),
    results_url VARCHAR(255),
    image_url VARCHAR(255),
    image_alt VARCHAR(255),
    fee VARCHAR(100),
    equipment JSONB, -- Array of equipment as JSON
    rules TEXT,
    is_external BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Records table
CREATE TABLE IF NOT EXISTS records (
    id VARCHAR(255) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL, -- e.g., "Herrar Recurve", "Damer Compound"
    name VARCHAR(255) NOT NULL,
    club VARCHAR(255),
    score VARCHAR(100) NOT NULL,
    date DATE,
    competition VARCHAR(255),
    competition_url VARCHAR(255),
    organizer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    logo_alt VARCHAR(255),
    priority INTEGER DEFAULT 0, -- For ordering (lower = higher priority)
    is_active BOOLEAN DEFAULT true,
    added_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    end_date DATE,
    time VARCHAR(20), -- e.g., "19:00"
    end_time VARCHAR(20),
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'other', -- competition, meeting, training, course, social, other
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    registration_required BOOLEAN DEFAULT false,
    registration_url VARCHAR(255),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Board members table
CREATE TABLE IF NOT EXISTS board_members (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL, -- Ordförande, Sekreterare, etc.
    name VARCHAR(255) NOT NULL,
    club VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    description TEXT,
    display_order INTEGER DEFAULT 0, -- For ordering display
    category VARCHAR(50) DEFAULT 'board', -- board, substitute, auditor, nomination
    is_active BOOLEAN DEFAULT true,
    added_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact information table
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL, -- main, regional, etc.
    name VARCHAR(255),
    position VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clubs_city ON clubs(city);
CREATE INDEX IF NOT EXISTS idx_clubs_welcomes_new_members ON clubs(welcomes_new_members);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
CREATE INDEX IF NOT EXISTS idx_competitions_is_external ON competitions(is_external);
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
CREATE INDEX IF NOT EXISTS idx_records_discipline ON records(discipline);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(active);
CREATE INDEX IF NOT EXISTS idx_sponsors_display_order ON sponsors(display_order);
CREATE INDEX IF NOT EXISTS idx_board_members_active ON board_members(active);
CREATE INDEX IF NOT EXISTS idx_board_members_display_order ON board_members(display_order);

-- Create trigger function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON board_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
