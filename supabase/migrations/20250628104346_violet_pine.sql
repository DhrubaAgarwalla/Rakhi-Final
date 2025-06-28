/*
  # Add shipping and tracking fields to orders table

  1. New Columns
    - `tracking_number` (text) - Tracking number from delivery partner
    - `awb_number` (text) - Air Waybill number
    - `delivery_partner` (text) - Name of delivery partner (delhivery, shiprocket, etc.)
    - `estimated_delivery` (date) - Estimated delivery date
    - `shipped_at` (timestamptz) - When the order was shipped
    - `delivered_at` (timestamptz) - When the order was delivered

  2. Changes
    - Add new columns to orders table
    - Update existing orders to have null values for new fields
*/

-- Add shipping and tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS awb_number text,
ADD COLUMN IF NOT EXISTS delivery_partner text,
ADD COLUMN IF NOT EXISTS estimated_delivery date,
ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Add index for tracking number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Add index for delivery partner
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders(delivery_partner);