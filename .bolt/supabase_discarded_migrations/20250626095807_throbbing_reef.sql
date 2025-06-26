/*
  # Update Orders Table with Indexes and Constraints

  1. Indexes
    - Add index for order_number lookups
    - Add index for payment_id lookups  
    - Add index for user orders with created_at

  2. Constraints
    - Set order_number as NOT NULL
    - Add check constraint for order status
    - Add check constraint for payment status

  3. Order Number Generation
    - Create sequence for order numbers
    - Create function to generate order numbers
    - Update existing orders without order numbers
*/

-- Create sequence for order numbers FIRST
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON public.orders(user_id, created_at DESC);

-- Update existing orders without order numbers BEFORE adding NOT NULL constraint
UPDATE public.orders 
SET order_number = 'RM' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE order_number IS NULL OR order_number = '';

-- Now add NOT NULL constraint after updating existing records
ALTER TABLE public.orders 
  ALTER COLUMN order_number SET NOT NULL;

-- Add check constraints
DO $$ 
BEGIN
  -- Add order status constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_order_status' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT check_order_status 
      CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
  END IF;

  -- Add payment status constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_payment_status' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT check_payment_status 
      CHECK (payment_status IS NULL OR payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Function to generate order number (created AFTER sequence)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'RM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
$$;