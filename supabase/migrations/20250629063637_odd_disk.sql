/*
  # Add app_settings table for email and delivery configuration

  1. New Tables
    - `app_settings`
      - `key` (text, primary key) - Setting identifier
      - `value` (jsonb) - Setting value as JSON
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_settings` table
    - Add policies for admin access and public read for specific settings
*/

-- Create app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app_settings (for delivery charges, etc.)
CREATE POLICY "Allow public read access to app_settings"
  ON app_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow admin to manage app_settings
CREATE POLICY "Allow admin to insert app_settings"
  ON app_settings
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Allow admin to update app_settings"
  ON app_settings
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Allow admin to delete app_settings"
  ON app_settings
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Insert default email configuration
INSERT INTO app_settings (key, value) VALUES 
('email_config', '{
  "provider": "emailjs",
  "from_email": "dhrubagarwala67@gmail.com",
  "from_name": "RakhiMart",
  "enabled": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert default delivery charge settings
INSERT INTO app_settings (key, value) VALUES 
('delivery_charge_settings', '{
  "flatDeliveryCharge": 50,
  "freeDeliveryThreshold": 499
}'::jsonb)
ON CONFLICT (key) DO NOTHING;