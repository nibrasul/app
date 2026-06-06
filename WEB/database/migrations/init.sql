-- Initialize Neon PostgreSQL Schema for Pertap

-- Drop existing tables if they exist to apply clean schema
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS click_events CASCADE;
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Profiles table (maintains jsonb profile_data for client UI compatibility)
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Profile views tracking for analytics
CREATE TABLE IF NOT EXISTS profile_views (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_ip VARCHAR(45),
  country_code VARCHAR(10),
  device_type VARCHAR(50),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_views_viewed_at ON profile_views(viewed_at);

-- Click events tracking for link analytics
CREATE TABLE IF NOT EXISTS click_events (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  visitor_ip VARCHAR(45),
  device_type VARCHAR(50),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clicks_profile_id ON click_events(profile_id);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL
);

-- Insert pricing tiers
INSERT INTO plans (name, price, features) VALUES
('Free', 0.00, '{"max_links": 3, "custom_themes": false}'),
('Pro', 9.99, '{"max_links": 15, "custom_themes": true}'),
('Enterprise', 49.99, '{"max_links": 100, "custom_themes": true}')
ON CONFLICT (name) DO NOTHING;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year')
);
