-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Allow users to read all profiles (or just their own)
CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
-- Allow users to insert their own profile on signup
CREATE POLICY "Allow users to insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Products Policies
-- Allow anyone to read products
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
-- Allow admin to insert/update (For MVP, we can allow authenticated users or just rely on the dashboard)
CREATE POLICY "Allow authenticated update products" ON products FOR UPDATE TO authenticated USING (true);

-- 3. Orders Policies
-- Allow users to read their own orders
CREATE POLICY "Allow users to read own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Allow users to insert their own orders
CREATE POLICY "Allow users to insert own orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Allow users to update their own orders (e.g. status)
CREATE POLICY "Allow users to update own orders" ON orders FOR UPDATE TO authenticated USING (true);

-- 4. Order Items Policies
-- Allow users to read order items
CREATE POLICY "Allow users to read own order items" ON order_items FOR SELECT TO authenticated USING (true);
-- Allow users to insert order items
CREATE POLICY "Allow users to insert own order items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Auto-create profile on signup trigger
-- This trigger automatically inserts a profile row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'business_name', split_part(new.email, '@', 1)),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
