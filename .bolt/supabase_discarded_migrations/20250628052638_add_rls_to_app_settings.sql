-- This migration adds RLS policies to the app_settings table

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app_settings
CREATE POLICY "Allow public read access to app_settings" ON app_settings FOR SELECT USING (true);

-- Allow admin to update app_settings
CREATE POLICY "Allow admin to update app_settings" ON app_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));