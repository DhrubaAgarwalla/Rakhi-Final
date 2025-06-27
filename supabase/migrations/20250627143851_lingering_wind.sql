/*
  # Wishlist Items Table

  1. New Tables
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wishlist_items` table
    - Add policies for users to manage their own wishlist items
*/

-- 1. Create the wishlist_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- 2. Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'wishlist_items' AND constraint_name = 'wishlist_items_user_id_product_id_key'
  ) THEN
    ALTER TABLE public.wishlist_items ADD CONSTRAINT wishlist_items_user_id_product_id_key UNIQUE (user_id, product_id);
  END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON public.wishlist_items;

-- 5. Create policies for users to manage their own wishlist items
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