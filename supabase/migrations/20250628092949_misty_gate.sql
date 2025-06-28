/*
  # Add RLS policies to app_settings table

  1. Security
    - Enable RLS on app_settings table
    - Add policy for public read access to app_settings
    - Add policy for admin update access to app_settings using user_roles table
*/

-- Enable RLS on app_settings table
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app_settings
CREATE POLICY "Allow public read access to app_settings" 
  ON app_settings 
  FOR SELECT 
  USING (true);

-- Allow admin to update app_settings (check admin role via user_roles table)
CREATE POLICY "Allow admin to update app_settings" 
  ON app_settings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admin to insert app_settings (check admin role via user_roles table)
CREATE POLICY "Allow admin to insert app_settings" 
  ON app_settings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admin to delete app_settings (check admin role via user_roles table)
CREATE POLICY "Allow admin to delete app_settings" 
  ON app_settings 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );