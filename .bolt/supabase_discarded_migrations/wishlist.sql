-- 1. Create the wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE (user_id, product_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to manage their own wishlist items
CREATE POLICY "Users can view their own wishlist items"
  ON public.wishlist_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON public.wishlist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.wishlist_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. (Optional) Allow users to update their own wishlist items (not usually needed)
CREATE POLICY "Users can update their own wishlist items"
  ON public.wishlist_items
  FOR UPDATE
  USING (auth.uid() = user_id);