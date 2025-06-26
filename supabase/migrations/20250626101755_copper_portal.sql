/*
  # Fix Order Number Generation

  1. New Tables
    - No new tables, just fixing existing orders table
  
  2. Changes
    - Add order_number column with proper generation
    - Add performance indexes
    - Fix existing data
  
  3. Security
    - No RLS changes needed
*/

-- Add order_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT;
  END IF;
END $$;

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Update existing orders that don't have order numbers using a simpler approach
DO $$
DECLARE
    order_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR order_record IN 
        SELECT id, created_at 
        FROM orders 
        WHERE order_number IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE orders 
        SET order_number = 'RM' || TO_CHAR(order_record.created_at, 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0')
        WHERE id = order_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Add NOT NULL constraint after updating existing records
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'orders' AND constraint_name = 'orders_order_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val INTEGER;
    order_num TEXT;
BEGIN
    next_val := nextval('order_number_seq');
    order_num := 'RM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(next_val::TEXT, 4, '0');
    RETURN order_num;
END;
$$;

-- Create trigger to auto-generate order numbers for new orders
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();