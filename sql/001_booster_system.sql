-- =============================================
-- BOOSTER CARD OPENING SYSTEM
-- =============================================
-- This schema creates:
-- 1. Users table (for auth)
-- 2. Cards table (with rarity)
-- 3. User inventory (cards owned + count)
-- 4. Daily booster tracking (5 boosters/day limit)
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- Card rarity enum
CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'holo', 'ultra');

-- Energy type enum
CREATE TYPE energy_type AS ENUM (
  'water', 'fire', 'grass', 'electric', 'psychic', 
  'fighting', 'dark', 'steel', 'fairy', 'dragon', 'colorless'
);

-- =============================================
-- USERS TABLE
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster username lookups
CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- CARDS TABLE
-- =============================================

CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subtitle VARCHAR(100),
  hp INTEGER NOT NULL DEFAULT 50,
  type energy_type NOT NULL,
  stage VARCHAR(20) NOT NULL DEFAULT 'Basic',
  pokedex_number VARCHAR(10),
  species VARCHAR(50),
  height VARCHAR(20),
  weight VARCHAR(20),
  image_url TEXT NOT NULL,
  weakness energy_type,
  retreat_cost INTEGER DEFAULT 1,
  flavor_text TEXT,
  illustrator VARCHAR(100),
  rarity card_rarity NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rarity-based queries (used in booster opening)
CREATE INDEX idx_cards_rarity ON cards(rarity);

-- =============================================
-- CARD ATTACKS TABLE
-- =============================================

CREATE TABLE card_attacks (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  damage INTEGER DEFAULT 0,
  energy_cost energy_type[] DEFAULT '{}',
  description TEXT
);

CREATE INDEX idx_card_attacks_card_id ON card_attacks(card_id);

-- =============================================
-- USER INVENTORY TABLE
-- Tracks which cards a user owns and how many of each
-- =============================================

CREATE TABLE user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  first_obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user can only have one entry per card
  UNIQUE(user_id, card_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_card_id ON user_inventory(card_id);

-- =============================================
-- USER DAILY BOOSTERS TABLE
-- Tracks how many boosters a user has opened per day
-- =============================================

CREATE TABLE user_daily_boosters (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  boosters_opened INTEGER NOT NULL DEFAULT 0,
  last_opened_at TIMESTAMP WITH TIME ZONE,
  
  -- Each user can only have one entry per day
  UNIQUE(user_id, date)
);

-- Index for faster daily lookups
CREATE INDEX idx_user_daily_boosters_user_date ON user_daily_boosters(user_id, date);

-- =============================================
-- BOOSTER OPENING HISTORY (optional, for analytics)
-- =============================================

CREATE TABLE booster_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cards_obtained INTEGER[] NOT NULL -- Array of card IDs obtained
);

CREATE INDEX idx_booster_history_user_id ON booster_history(user_id);
CREATE INDEX idx_booster_history_opened_at ON booster_history(opened_at);

-- =============================================
-- RARITY PROBABILITY CONFIGURATION TABLE
-- Allows adjusting probabilities without code changes
-- =============================================

CREATE TABLE rarity_probabilities (
  rarity card_rarity PRIMARY KEY,
  probability DECIMAL(5, 4) NOT NULL, -- e.g., 0.5000 = 50%
  
  -- Ensure probabilities are valid
  CONSTRAINT valid_probability CHECK (probability >= 0 AND probability <= 1)
);

-- Insert default probabilities (must sum to 1.0)
-- Common: 50%, Uncommon: 30%, Rare: 12%, Holo: 6%, Ultra: 2%
INSERT INTO rarity_probabilities (rarity, probability) VALUES
  ('common', 0.50),
  ('uncommon', 0.30),
  ('rare', 0.12),
  ('holo', 0.06),
  ('ultra', 0.02);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get a random rarity based on probabilities
CREATE OR REPLACE FUNCTION get_random_rarity()
RETURNS card_rarity AS $$
DECLARE
  rand DECIMAL;
  cumulative DECIMAL := 0;
  r RECORD;
BEGIN
  rand := random();
  
  FOR r IN (SELECT rarity, probability FROM rarity_probabilities ORDER BY probability DESC)
  LOOP
    cumulative := cumulative + r.probability;
    IF rand <= cumulative THEN
      RETURN r.rarity;
    END IF;
  END LOOP;
  
  -- Fallback to common
  RETURN 'common';
END;
$$ LANGUAGE plpgsql;

-- Function to get a random card of a specific rarity
CREATE OR REPLACE FUNCTION get_random_card_by_rarity(target_rarity card_rarity)
RETURNS INTEGER AS $$
DECLARE
  card_id INTEGER;
BEGIN
  SELECT id INTO card_id
  FROM cards
  WHERE rarity = target_rarity
  ORDER BY random()
  LIMIT 1;
  
  -- If no card found with that rarity, try to get any card
  IF card_id IS NULL THEN
    SELECT id INTO card_id
    FROM cards
    ORDER BY random()
    LIMIT 1;
  END IF;
  
  RETURN card_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get 3 random cards for a booster pack
CREATE OR REPLACE FUNCTION get_booster_cards()
RETURNS TABLE(card_id INTEGER, rarity card_rarity) AS $$
DECLARE
  i INTEGER;
  r card_rarity;
  c_id INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    r := get_random_rarity();
    c_id := get_random_card_by_rarity(r);
    
    card_id := c_id;
    rarity := r;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can open a booster today
CREATE OR REPLACE FUNCTION can_open_booster(p_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_boosters INTEGER := 5;
BEGIN
  SELECT boosters_opened INTO current_count
  FROM user_daily_boosters
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF current_count IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_boosters;
END;
$$ LANGUAGE plpgsql;

-- Function to get remaining boosters for today
CREATE OR REPLACE FUNCTION get_remaining_boosters(p_user_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_boosters INTEGER := 5;
BEGIN
  SELECT boosters_opened INTO current_count
  FROM user_daily_boosters
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF current_count IS NULL THEN
    RETURN max_boosters;
  END IF;
  
  RETURN max_boosters - current_count;
END;
$$ LANGUAGE plpgsql;

-- Main function to open a booster pack
-- Returns the cards obtained or NULL if limit reached
-- SECURITY DEFINER allows the function to bypass RLS and execute with owner privileges
CREATE OR REPLACE FUNCTION open_booster(p_user_id UUID)
RETURNS TABLE(
  out_card_id INTEGER,
  out_card_name VARCHAR,
  out_card_rarity card_rarity,
  out_card_image_url TEXT,
  out_is_new BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booster_cards RECORD;
  obtained_cards INTEGER[] := '{}';
  v_was_new BOOLEAN;
  v_card_id INTEGER;
BEGIN
  -- Ensure user exists in users table (auto-create if not)
  INSERT INTO users (id, username, password_hash)
  VALUES (p_user_id, 'user_' || LEFT(p_user_id::TEXT, 8), 'external_auth')
  ON CONFLICT (id) DO NOTHING;

  -- Check if user can open a booster
  IF NOT can_open_booster(p_user_id) THEN
    RAISE EXCEPTION 'Daily booster limit reached (5/5)';
  END IF;
  
  -- Get 3 random cards
  FOR booster_cards IN SELECT * FROM get_booster_cards()
  LOOP
    v_card_id := booster_cards.card_id;
    
    -- Check if card is new for user
    SELECT NOT EXISTS(
      SELECT 1 FROM user_inventory ui 
      WHERE ui.user_id = p_user_id AND ui.card_id = v_card_id
    ) INTO v_was_new;
    
    -- Add to inventory (upsert)
    INSERT INTO user_inventory (user_id, card_id, quantity, first_obtained_at, last_obtained_at)
    VALUES (p_user_id, v_card_id, 1, NOW(), NOW())
    ON CONFLICT (user_id, card_id) 
    DO UPDATE SET 
      quantity = user_inventory.quantity + 1,
      last_obtained_at = NOW();
    
    -- Track card for history
    obtained_cards := array_append(obtained_cards, v_card_id);
    
    -- Return card info
    SELECT c.id, c.name, c.rarity, c.image_url, v_was_new
    INTO out_card_id, out_card_name, out_card_rarity, out_card_image_url, out_is_new
    FROM cards c WHERE c.id = v_card_id;
    
    RETURN NEXT;
  END LOOP;
  
  -- Update daily booster count
  INSERT INTO user_daily_boosters (user_id, date, boosters_opened, last_opened_at)
  VALUES (p_user_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    boosters_opened = user_daily_boosters.boosters_opened + 1,
    last_opened_at = NOW();
  
  -- Record in history
  INSERT INTO booster_history (user_id, cards_obtained)
  VALUES (p_user_id, obtained_cards);
  
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_boosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE booster_history ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY users_policy ON users
  FOR ALL USING (id = auth.uid());

CREATE POLICY user_inventory_policy ON user_inventory
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_daily_boosters_policy ON user_daily_boosters
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY booster_history_policy ON booster_history
  FOR ALL USING (user_id = auth.uid());

-- Cards are readable by everyone
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY cards_read_policy ON cards
  FOR SELECT USING (true);

-- Rarity probabilities readable by everyone
ALTER TABLE rarity_probabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY rarity_probabilities_read_policy ON rarity_probabilities
  FOR SELECT USING (true);

-- =============================================
-- VIEWS FOR EASIER QUERYING
-- =============================================

-- View to get user's collection with card details
CREATE OR REPLACE VIEW user_collection AS
SELECT 
  ui.user_id,
  ui.card_id,
  ui.quantity,
  ui.first_obtained_at,
  ui.last_obtained_at,
  c.name,
  c.subtitle,
  c.hp,
  c.type,
  c.rarity,
  c.image_url,
  c.pokedex_number
FROM user_inventory ui
JOIN cards c ON c.id = ui.card_id;

-- View to get collection completion stats
CREATE OR REPLACE VIEW user_collection_stats AS
SELECT 
  ui.user_id,
  COUNT(DISTINCT ui.card_id) as unique_cards,
  SUM(ui.quantity) as total_cards,
  (SELECT COUNT(*) FROM cards) as total_available,
  ROUND(
    COUNT(DISTINCT ui.card_id)::DECIMAL / NULLIF((SELECT COUNT(*) FROM cards), 0) * 100, 
    2
  ) as completion_percentage
FROM user_inventory ui
GROUP BY ui.user_id;

-- View to get today's booster status
CREATE OR REPLACE VIEW user_booster_status AS
SELECT 
  u.id as user_id,
  u.username,
  COALESCE(udb.boosters_opened, 0) as boosters_opened_today,
  5 - COALESCE(udb.boosters_opened, 0) as boosters_remaining,
  udb.last_opened_at
FROM users u
LEFT JOIN user_daily_boosters udb 
  ON u.id = udb.user_id AND udb.date = CURRENT_DATE;

