/*
  # Fix Profile Creation RLS Policy

  1. Security Changes
    - Update RLS policies to allow profile creation for new users
    - Ensure proper authentication flow for guest users
    - Fix the profile creation process

  2. Changes Made
    - Drop existing restrictive policies
    - Create new policies that allow profile creation during signup
    - Add proper policies for profile management
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow anon users to create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new, more permissive policies for profile creation
CREATE POLICY "Enable profile creation for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to create profiles (for edge functions)
CREATE POLICY "Enable profile creation for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure the profiles table has proper structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace the handle_new_user function to ensure profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();