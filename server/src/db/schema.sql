-- Brand&co. backend schema
-- Safe to re-run: every statement is idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;   -- for case-insensitive email columns

-- ─── USERS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          CITEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT,
  role           TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────
-- Mirrors the shape already used by the static site's products.js so the
-- catalog can be seeded directly from it (see src/db/seed.js).
CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY,               -- e.g. "business-cards-001"
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  price            NUMERIC(12,2) NOT NULL,
  discount_price   NUMERIC(12,2),
  short_desc       TEXT,
  description      TEXT,
  images           JSONB NOT NULL DEFAULT '[]',
  specifications   JSONB NOT NULL DEFAULT '{}',
  options          JSONB NOT NULL DEFAULT '[]',
  variant_pricing  JSONB,                           -- { "ChoiceA|ChoiceB": price }
  quantity_config  JSONB,                           -- { min, step, default, unit, priceBasis }
  custom_design    BOOLEAN NOT NULL DEFAULT false,
  stock            TEXT NOT NULL DEFAULT 'In Stock',
  delivery_time    TEXT,
  related_products JSONB NOT NULL DEFAULT '[]',
  featured         BOOLEAN NOT NULL DEFAULT false,
  badge            TEXT,
  seo_title        TEXT,
  seo_desc         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured);

-- ─── CARTS ───────────────────────────────────────────────────────────────
-- A cart belongs to either a logged-in user OR a guest identified by an
-- opaque token stored in a cookie/localStorage on the frontend.
CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  token      TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner_present CHECK (user_id IS NOT NULL OR token IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  options       JSONB NOT NULL DEFAULT '{}',    -- selected chip/colour choices
  package_size  INTEGER,                        -- bulk tier, e.g. 300 (pcs)
  unit_price    NUMERIC(12,2) NOT NULL,          -- resolved price snapshot at add-time
  qty           INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE,       -- human-friendly, e.g. BC-20260709-0001
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name     TEXT NOT NULL,
  customer_email    CITEXT NOT NULL,
  customer_phone    TEXT,
  shipping_address  JSONB NOT NULL DEFAULT '{}',
  subtotal          NUMERIC(12,2) NOT NULL,
  delivery_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  status            TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'failed', 'fulfilled', 'cancelled')),
  payment_provider  TEXT NOT NULL DEFAULT 'paystack',
  payment_reference TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id),
  product_name  TEXT NOT NULL,       -- snapshot, survives later catalog edits
  options       JSONB NOT NULL DEFAULT '{}',
  package_size  INTEGER,
  unit_price    NUMERIC(12,2) NOT NULL,
  qty           INTEGER NOT NULL CHECK (qty > 0),
  line_total    NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────
-- One row per Paystack transaction attempt against an order (an order can
-- have more than one if the shopper retries after a failed payment).
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reference     TEXT NOT NULL UNIQUE,
  provider      TEXT NOT NULL DEFAULT 'paystack',
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'NGN',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  raw_response  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
