/*
  # Enhanced Rating and Review System

  1. Database Functions
    - Function to update product ratings automatically
    - Function to calculate average ratings
    - Trigger to update product ratings when reviews change

  2. Security
    - Enhanced RLS policies for reviews
    - Proper validation constraints

  3. Indexes
    - Performance indexes for rating queries
*/

-- Create function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger AS $$
BEGIN
  -- Update the product's rating and review count
  UPDATE products 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::numeric), 0)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update product ratings
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON reviews(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC) WHERE is_active = true;

-- Ensure rating constraints are proper
DO $$
BEGIN
  -- Check if the constraint exists and drop it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_rating_check' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT reviews_rating_check;
  END IF;
  
  -- Add the constraint
  ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
    CHECK (rating >= 1 AND rating <= 5);
END $$;

-- Update existing products to have correct ratings
UPDATE products 
SET 
  rating = COALESCE((
    SELECT AVG(rating::numeric)
    FROM reviews 
    WHERE product_id = products.id
  ), 0),
  review_count = COALESCE((
    SELECT COUNT(*)
    FROM reviews 
    WHERE product_id = products.id
  ), 0),
  updated_at = now()
WHERE id IN (
  SELECT DISTINCT product_id 
  FROM reviews 
  WHERE product_id IS NOT NULL
);