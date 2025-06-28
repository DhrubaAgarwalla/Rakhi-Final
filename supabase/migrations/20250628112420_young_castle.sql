/*
  # Add shipping fields to orders table

  1. New Columns
    - `tracking_number` (text) - Tracking number from shipping provider
    - `awb_number` (text) - Air Waybill number
    - `delivery_partner` (text) - Name of delivery partner (shiprocket, delhivery, etc.)
    - `estimated_delivery` (date) - Estimated delivery date
    - `shipped_at` (timestamptz) - When the order was shipped
    - `delivered_at` (timestamptz) - When the order was delivered

  2. Indexes
    - Add indexes for tracking_number and delivery_partner for better query performance
*/

-- Add shipping-related columns to orders table
DO $$
BEGIN
  -- Add tracking_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number text;
  END IF;

  -- Add awb_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'awb_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN awb_number text;
  END IF;

  -- Add delivery_partner column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_partner'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_partner text;
  END IF;

  -- Add estimated_delivery column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery date;
  END IF;

  -- Add shipped_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipped_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipped_at timestamptz;
  END IF;

  -- Add delivered_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders (tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders (delivery_partner);