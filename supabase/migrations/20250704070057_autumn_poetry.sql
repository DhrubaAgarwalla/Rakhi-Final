/*
  # Complete Rating System Setup

  1. Tables
    - Ensure reviews table has proper structure and constraints
    - Add any missing indexes for performance
    
  2. Functions
    - Complete the update_product_rating function
    - Ensure proper error handling
    
  3. Security
    - Review and update RLS policies for reviews
    - Ensure proper access controls
    
  4. Data Integrity
    - Add proper constraints and validations
    - Ensure rating calculations are accurate
*/

-- Ensure reviews table has all necessary columns
DO $$
BEGIN
  -- Check and add missing columns if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'title'
  ) THEN
    ALTER TABLE reviews ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'comment'
  ) THEN
    ALTER TABLE reviews ADD COLUMN comment text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure products table has rating columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'rating'
  ) THEN
    ALTER TABLE products ADD COLUMN rating numeric(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE products ADD COLUMN review_count integer DEFAULT 0;
  END IF;
END $$;

-- Create or replace the rating update function with better error handling
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger AS $$
DECLARE
  product_uuid uuid;
  avg_rating numeric;
  total_reviews integer;
BEGIN
  -- Get the product ID from either NEW or OLD record
  product_uuid := COALESCE(NEW.product_id, OLD.product_id);
  
  -- Skip if no product ID
  IF product_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Calculate average rating and count
  SELECT 
    COALESCE(AVG(rating::numeric), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM reviews 
  WHERE product_id = product_uuid;
  
  -- Update the product
  UPDATE products 
  SET 
    rating = ROUND(avg_rating, 2),
    review_count = total_reviews,
    updated_at = now()
  WHERE id = product_uuid;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error updating product rating for product %: %', product_uuid, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Update RLS policies for reviews to be more comprehensive
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Allow everyone to view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create reviews for products
CREATE POLICY "Users can create own reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add unique constraint to prevent multiple reviews from same user for same product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_product_id_user_id_key' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_product_id_user_id_key 
      UNIQUE (product_id, user_id);
  END IF;
END $$;

-- Ensure rating constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_rating_check' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
      CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON reviews(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC) WHERE is_active = true;

-- Update all existing products to have correct ratings
UPDATE products 
SET 
  rating = COALESCE((
    SELECT ROUND(AVG(rating::numeric), 2)
    FROM reviews 
    WHERE product_id = products.id
  ), 0),
  review_count = COALESCE((
    SELECT COUNT(*)
    FROM reviews 
    WHERE product_id = products.id
  ), 0),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM reviews WHERE product_id = products.id
) OR rating IS NULL OR review_count IS NULL;

-- Add some sample reviews for testing (optional - remove in production)
-- This helps demonstrate the rating system with actual data
DO $$
DECLARE
  sample_product_id uuid;
  sample_user_id uuid;
BEGIN
  -- Get a sample product
  SELECT id INTO sample_product_id FROM products WHERE is_active = true LIMIT 1;
  
  -- Get a sample user (admin user if exists)
  SELECT user_id INTO sample_user_id FROM user_roles WHERE role = 'admin' LIMIT 1;
  
  -- Only add sample data if we have both product and user, and no reviews exist yet
  IF sample_product_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = sample_product_id) THEN
      -- Add a sample review
      INSERT INTO reviews (product_id, user_id, rating, title, comment, created_at)
      VALUES (
        sample_product_id,
        sample_user_id,
        5,
        'Beautiful Rakhi!',
        'Absolutely loved this Rakhi! The quality is excellent and the design is stunning. Perfect for Raksha Bandhan celebrations.',
        now()
      );
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors in sample data creation
    NULL;
END $$;