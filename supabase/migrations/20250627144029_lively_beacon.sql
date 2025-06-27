/*
  # Fix Wishlist Table References

  1. Changes
    - Update wishlist_items table to reference profiles instead of auth.users
    - This aligns with the existing database structure where other tables reference profiles
    
  2. Security
    - Update RLS policies to work with the corrected foreign key
*/

-- Drop existing foreign key constraint and recreate with correct reference
ALTER TABLE public.wishlist_items 
DROP CONSTRAINT IF EXISTS wishlist_items_user_id_fkey;

-- Add correct foreign key constraint to profiles table
ALTER TABLE public.wishlist_items 
ADD CONSTRAINT wishlist_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies to use the correct uid() function
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON public.wishlist_items;

-- Create updated policies that work with profiles
CREATE POLICY "Users can view their own wishlist items"
  ON public.wishlist_items
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON public.wishlist_items
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.wishlist_items
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON public.wishlist_items
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);