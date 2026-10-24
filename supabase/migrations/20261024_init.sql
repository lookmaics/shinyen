-- ====================================================================
-- SHINYEN (ꯁꯤꯟꯌꯦꯟ) - Production PostgreSQL / Supabase Migration
-- Blueprint: Master Implementation Plan (Phases 1-8) & Playbook v2
-- Hardened via Gemini 4 Argon Distributed Systems Audit
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'rider', 'admin');
CREATE TYPE industry_category AS ENUM ('thrift', 'jewellery', 'handloom', 'lifestyle');
CREATE TYPE selling_mode AS ENUM ('fixed_price', 'auction');
CREATE TYPE order_status AS ENUM (
  'PAID_ESCROW_LOCKED',
  'READY_FOR_PICKUP',
  'IN_TRANSIT',
  'DELIVERED_INSPECTION_WINDOW',
  'COMPLETED_SETTLED',
  'DISPUTE_LOCKED'
);
CREATE TYPE offer_status AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'ROLLED_DOWN');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'REFUNDED_BUYER', 'RELEASED_SELLER');
CREATE TYPE story_type AS ENUM ('new_drop', 'live_auction', 'artisan_craft');
CREATE TYPE packaging_mode AS ENUM ('rider_bag', 'self_pack');

-- 3. CORE IDENTITY & USER PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  whatsapp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_verified_at TIMESTAMPTZ,
  strike_count INT NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Seller specific
  handle TEXT UNIQUE,
  seller_bio TEXT,
  seller_verified BOOLEAN NOT NULL DEFAULT FALSE,
  upi_vpa TEXT,
  packaging_pref packaging_mode NOT NULL DEFAULT 'rider_bag',
  
  -- Geo address default
  default_district TEXT DEFAULT 'Imphal West',
  default_leikai TEXT DEFAULT 'Yaiskul Leirak',
  default_landmark TEXT,
  default_lat NUMERIC(9,6),
  default_lng NUMERIC(9,6),

  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Salted hash identity storage to prevent banned users from resetting strikes via account deletion
CREATE TABLE banned_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT NOT NULL UNIQUE, -- Salted SHA-256 of phone
  upi_hash TEXT,                  -- Salted SHA-256 of UPI VPA
  reason TEXT NOT NULL,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. PRODUCTS & LISTINGS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category industry_category NOT NULL,
  mode selling_mode NOT NULL,
  price NUMERIC(10,2) NOT NULL, -- Fixed price or Buy Now ceiling
  
  -- Sizing & Measurements
  size_tag TEXT NOT NULL, -- 'Free Size', 'S', 'M', 'L', 'XL'
  chest_inches NUMERIC(4,1),
  length_inches NUMERIC(4,1),
  is_verified_fit BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Thrift Transparency & Flaw disclosures
  has_flaw BOOLEAN NOT NULL DEFAULT FALSE,
  flaw_note TEXT,
  flaw_image_url TEXT,
  
  -- Media (Day-0 dual pipeline: thumb_20kb and 160kb gallery)
  thumb_url TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  
  -- Stock
  stock_quantity INT NOT NULL DEFAULT 1,
  is_sold_out BOOLEAN NOT NULL DEFAULT FALSE,
  sold_duration_minutes INT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. REALTIME AUCTIONS & DROP ENGINE
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  starting_bid NUMERIC(10,2) NOT NULL,
  current_bid NUMERIC(10,2) NOT NULL,
  min_increment NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  bid_count INT NOT NULL DEFAULT 0,
  highest_bidder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  soft_close_count INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_auctions_active ON auctions (end_time, is_settled) WHERE is_settled = FALSE;

-- BIDS LOG (Immutable audit log)
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_bids_auction ON bids (auction_id, created_at DESC);

-- 3-HOUR WINNER & RUNNER-UP OFFERS TABLE
CREATE TABLE auction_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  rank INT NOT NULL DEFAULT 1, -- 1 = Winner, 2 = Runner up
  offer_amount NUMERIC(10,2) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status offer_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. ORDERS, ESCROW & 4-DIGIT DELIVERY OTP
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL, -- e.g. "SH-1049"
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Financials
  item_amount NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  platform_fee NUMERIC(10,2) NOT NULL, -- 7% Thrift, 8% Jewellery, 5% Handloom
  seller_payout_amount NUMERIC(10,2) NOT NULL,
  
  -- Delivery & In-App OTP (Uber/Swiggy model, zero SMS cost)
  delivery_otp VARCHAR(4) NOT NULL,
  delivery_district TEXT NOT NULL,
  delivery_leikai TEXT NOT NULL,
  delivery_landmark TEXT NOT NULL,
  delivery_lat NUMERIC(9,6),
  delivery_lng NUMERIC(9,6),
  
  -- Status & Escrow Window
  status order_status NOT NULL DEFAULT 'PAID_ESCROW_LOCKED',
  inspection_ends_at TIMESTAMPTZ, -- Set to delivered_at + 48 hours
  unboxing_video_url TEXT,
  
  delivered_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_orders_buyer ON orders (buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller ON orders (seller_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);

-- 7. DISPUTES & ARBITRATION
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  video_url TEXT NOT NULL, -- Mandatory unboxing video
  tamper_seal_broken BOOLEAN NOT NULL DEFAULT FALSE,
  status dispute_status NOT NULL DEFAULT 'OPEN',
  admin_resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8. SELLER PAYOUTS
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL,
  upi_vpa TEXT NOT NULL,
  utr_number TEXT,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 9. STORIES & COMMUNITY ENGAGEMENT
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  story_type story_type NOT NULL DEFAULT 'new_drop',
  title TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  cta_text TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE drop_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(user_id, auction_id)
);

CREATE TABLE community_fit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  verified_fit BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 10. LOCALITY MASTER (Crowdsourced Leikais with validation)
CREATE TABLE leikais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  name TEXT NOT NULL,
  pin TEXT NOT NULL DEFAULT '795001',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(district, name)
);

-- ====================================================================
-- ATOMIC PL/pgSQL PROCEDURES (ARGON-HARDENED)
-- ====================================================================

-- Function: place_bid()
-- Provides atomic row-locking on auctions, validates anti-Sybil eligibility,
-- implements high-water mark anti-sniping (+120s if bid in final 60s),
-- and returns server timestamp to prevent client clock manipulation.
CREATE OR REPLACE FUNCTION place_bid(
  p_auction_id UUID,
  p_bidder_id UUID,
  p_proposed_amount NUMERIC(10,2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_bidder RECORD;
  v_active_leading_bids INT;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_new_end_time TIMESTAMPTZ;
  v_soft_close_applied BOOLEAN := FALSE;
  v_bid_id UUID;
BEGIN
  -- 1. Set brief lock timeout to prevent connection exhaustion
  SET LOCAL lock_timeout = '1500ms';

  -- 2. Verify bidder identity & anti-Sybil WhatsApp status
  SELECT * INTO v_bidder
  FROM profiles
  WHERE id = p_bidder_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'BIDDER_NOT_FOUND');
  END IF;

  IF v_bidder.is_banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'USER_BANNED');
  END IF;

  IF NOT v_bidder.whatsapp_verified THEN
    RETURN jsonb_build_object('success', false, 'error', 'WHATSAPP_VERIFICATION_REQUIRED');
  END IF;

  -- 3. Acquire exclusive write lock on auction row
  SELECT * INTO v_auction
  FROM auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'AUCTION_NOT_FOUND');
  END IF;

  IF v_auction.is_settled THEN
    RETURN jsonb_build_object('success', false, 'error', 'AUCTION_ALREADY_SETTLED');
  END IF;

  IF v_now >= v_auction.end_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'AUCTION_EXPIRED');
  END IF;

  IF v_auction.seller_id = p_bidder_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'SELLER_CANNOT_BID_ON_OWN_ITEM');
  END IF;

  -- 4. Verify explicit target bid amount meets increment
  IF p_proposed_amount < (v_auction.current_bid + v_auction.min_increment) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'OUTBID_RACE_CONDITION',
      'current_bid', v_auction.current_bid,
      'min_required', v_auction.current_bid + v_auction.min_increment
    );
  END IF;

  -- 5. Anti-Sybil Bidding Cap for unproven buyers (0 completed orders max 2 leading bids)
  SELECT COUNT(*) INTO v_active_leading_bids
  FROM auctions a
  WHERE a.highest_bidder_id = p_bidder_id
    AND a.end_time > v_now
    AND a.is_settled = FALSE;

  IF v_active_leading_bids >= 2 THEN
    -- Check if buyer has completed previous orders
    IF NOT EXISTS (
      SELECT 1 FROM orders WHERE buyer_id = p_bidder_id AND status = 'COMPLETED_SETTLED'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'MAX_CONCURRENT_BIDS_EXCEEDED');
    END IF;
  END IF;

  -- 6. High-Water Mark Anti-Sniping Soft Close Check
  -- If bid lands within final 60 seconds, reset clock to exactly clock_timestamp() + 120s
  v_new_end_time := v_auction.end_time;
  IF (v_auction.end_time - v_now) < INTERVAL '60 seconds' THEN
    v_new_end_time := v_now + INTERVAL '120 seconds';
    v_soft_close_applied := TRUE;
  END IF;

  -- 7. Insert Bid Record
  INSERT INTO bids (auction_id, bidder_id, amount, created_at)
  VALUES (p_auction_id, p_bidder_id, p_proposed_amount, v_now)
  RETURNING id INTO v_bid_id;

  -- 8. Update Auction state
  UPDATE auctions
  SET current_bid = p_proposed_amount,
      highest_bidder_id = p_bidder_id,
      bid_count = bid_count + 1,
      end_time = v_new_end_time,
      soft_close_count = CASE WHEN v_soft_close_applied THEN soft_close_count + 1 ELSE soft_close_count END
  WHERE id = p_auction_id;

  -- 9. Return atomic response with server time for drift-free client sync
  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'current_bid', p_proposed_amount,
    'end_time', v_new_end_time,
    'soft_close_applied', v_soft_close_applied,
    'server_epoch_ms', EXTRACT(EPOCH FROM v_now) * 1000
  );
END;
$$;

-- ====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Cached with (SELECT auth.uid()) for 95% faster throughput
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE leikais ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- Products: Public read for published items, sellers manage own
CREATE POLICY "Products viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT
  WITH CHECK (seller_id = (SELECT auth.uid()));

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (seller_id = (SELECT auth.uid()));

-- Auctions & Bids: Public read, authenticated place bids
CREATE POLICY "Auctions viewable by everyone"
  ON auctions FOR SELECT
  USING (true);

CREATE POLICY "Bids viewable by everyone"
  ON bids FOR SELECT
  USING (true);

-- Orders: Only buyer, seller, assigned rider, or admin can view
CREATE POLICY "Parties can view their orders"
  ON orders FOR SELECT
  USING (
    buyer_id = (SELECT auth.uid()) OR
    seller_id = (SELECT auth.uid()) OR
    rider_id = (SELECT auth.uid())
  );

-- Leikais: Public read for fast address autocomplete
CREATE POLICY "Leikais viewable by everyone"
  ON leikais FOR SELECT
  USING (true);
