/*
  # Fix Admin Product Management Permissions

  1. Security Updates
    - Add admin policies for product management
    - Add admin policies for category management
    - Create helper function for admin checks
    - Update existing policies to allow admin access

  2. Changes
    - Allow admins to create, update, and delete products
    - Allow admins to manage categories
    - Maintain existing public read access
    - Ensure proper RLS enforcement
*/

-- Create helper function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$$;

-- Add admin policies for products table
CREATE POLICY "Admins can insert products" 
  ON public.products 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" 
  ON public.products 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete products" 
  ON public.products 
  FOR DELETE 
  TO authenticated
  USING (public.is_admin());

-- Add admin policies for categories table
CREATE POLICY "Admins can insert categories" 
  ON public.categories 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" 
  ON public.categories 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories" 
  ON public.categories 
  FOR DELETE 
  TO authenticated
  USING (public.is_admin());

-- Update existing policies to be more explicit about public access
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories 
  FOR SELECT 
  TO public
  USING (true);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
  ON public.products 
  FOR SELECT 
  TO public
  USING (true);

-- Add admin policies for orders management
CREATE POLICY "Admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());

-- Add admin policies for order items management
CREATE POLICY "Admins can view all order items" 
  ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

-- Add admin policies for reviews management
CREATE POLICY "Admins can manage all reviews" 
  ON public.reviews 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());

-- Add admin policies for user profiles (read-only for privacy)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());