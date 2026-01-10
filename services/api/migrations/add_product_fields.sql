-- Migration: Add missing columns to products table
-- Version: 1.0
-- Date: 2026-01-10

-- Add product_type column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'simple';

-- Add description column (if not exists)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add category column (if not exists)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Add attributes column (JSONB for flexible attributes)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Add seo column (JSONB for meta tags)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;

-- Add tiktok column (JSONB for caption + hashtags)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tiktok JSONB DEFAULT '{}'::jsonb;

-- Add channels column (JSONB array for synced channels)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '[]'::jsonb;

-- Update existing product with defaults
UPDATE products 
SET 
  product_type = 'simple',
  description = 'Keine Beschreibung',
  category = 'Allgemein',
  attributes = '{"material": "", "color": "", "size": ""}'::jsonb,
  seo = '{"title": "Test", "description": "Test Produkt"}'::jsonb,
  tiktok = '{"caption": "", "hashtags": ""}'::jsonb,
  channels = '[]'::jsonb
WHERE id = '9acd72c6-b804-482d-9da5-67a1799bbca1';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_attributes ON products USING GIN(attributes);
