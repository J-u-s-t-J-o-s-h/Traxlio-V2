-- Traxlio Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database
-- This script is safe to run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING OBJECTS (for clean re-runs)
-- =============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_boxes_updated_at ON boxes;
DROP TRIGGER IF EXISTS update_items_updated_at ON items;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can update their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can delete their own rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can create their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can update their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can delete their own boxes" ON boxes;

DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can create their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

DROP POLICY IF EXISTS "Users can view their own shares" ON shares;
DROP POLICY IF EXISTS "Anyone can view public shares" ON shares;
DROP POLICY IF EXISTS "Users can create their own shares" ON shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON shares;

DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON activities;

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS boxes CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =============================================
-- CREATE TABLES
-- =============================================

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boxes table
CREATE TABLE boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shares table
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('room', 'box', 'item')),
  resource_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'move')),
  type TEXT NOT NULL CHECK (type IN ('room', 'box', 'item')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  parent_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES
-- =============================================

CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_boxes_user_id ON boxes(user_id);
CREATE INDEX idx_boxes_room_id ON boxes(room_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_box_id ON items(box_id);
CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_resource_id ON shares(resource_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Rooms policies
CREATE POLICY "Users can view their own rooms" ON rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms" ON rooms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms" ON rooms
  FOR DELETE USING (auth.uid() = user_id);

-- Boxes policies
CREATE POLICY "Users can view their own boxes" ON boxes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boxes" ON boxes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boxes" ON boxes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boxes" ON boxes
  FOR DELETE USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Users can view their own shares" ON shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public shares" ON shares
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own shares" ON shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON shares
  FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CREATE FUNCTION & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boxes_updated_at
  BEFORE UPDATE ON boxes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
-- If you see this, the schema was created successfully!
