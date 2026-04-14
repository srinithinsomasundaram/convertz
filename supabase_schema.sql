-- Setup for NextAuth.js (v5) and custom history tracking

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,
  email        TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image        TEXT
);

-- 2. Accounts table (for OAuth providers like Google)
CREATE TABLE IF NOT EXISTS accounts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  providerAccountId  TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         INT,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  session_state      TEXT,
  
  UNIQUE(provider, providerAccountId)
);

-- 3. Sessions (if using database strategy, though JWT is recommended)
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires      TIMESTAMPTZ NOT NULL,
  sessionToken TEXT UNIQUE NOT NULL
);

-- 4. Verification Tokens (for Magic Links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  
  PRIMARY KEY (identifier, token)
);

-- 5. Custom: Conversions History Table
CREATE TABLE IF NOT EXISTS conversions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid       UUID REFERENCES users(id) ON DELETE CASCADE,
  guestid      TEXT,
  toolid       TEXT NOT NULL,
  toolslug     TEXT NOT NULL,
  toolname     TEXT NOT NULL,
  filename     TEXT NOT NULL,
  status       TEXT DEFAULT 'completed',
  uploadurl    TEXT, -- Cloudinary secure URL
  cloudinarypublicid TEXT,
  cloudinaryresourcetype TEXT,
  createdat    TIMESTAMPTZ DEFAULT now(),
  expiresat    TIMESTAMPTZ -- Purge reference (30 mins typically)
);

ALTER TABLE conversions
  ADD CONSTRAINT conversions_owner_check
  CHECK (userId IS NOT NULL OR guestId IS NOT NULL);

-- Index for faster history retrieval
CREATE INDEX idx_conversions_user ON conversions(userId);
CREATE INDEX idx_conversions_guest ON conversions(guestId);
CREATE INDEX idx_conversions_created ON conversions(createdAt);
CREATE INDEX idx_conversions_expires ON conversions(expiresAt);
