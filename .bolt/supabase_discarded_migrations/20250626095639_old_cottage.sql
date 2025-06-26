/*
  # Update Orders Table for Razorpay Integration

  1. Changes
    - Add proper order_number generation
    - Update payment tracking fields
    - Add indexes for better performance
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Add proper constraints
*/

-- Add index for order_number lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Add index for payment_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);

-- Add index for user orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON public.orders(user_id, created_at DESC);

-- Update orders table to ensure proper constraints
ALTER TABLE public.orders 
  ALTER COLUMN order_number SET NOT NULL;

-- Add check constraint for order status
ALTER TABLE public.orders 
  ADD CONSTRAINT check_order_status 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add check constraint for payment status
ALTER TABLE public.orders 
  ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IS NULL OR payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'RM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
$$;

-- Create sequence for order numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Update existing orders without order numbers
UPDATE public.orders 
SET order_number = 'RM' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE order_number IS NULL OR order_number = '';