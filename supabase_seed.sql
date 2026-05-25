-- 1. Profiles table (Links to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  delivery_address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('fruit', 'vegetable', 'other')),
  description TEXT,
  image_url TEXT,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  unit_type TEXT NOT NULL, -- e.g., 'kg', 'box', 'pallet'
  bulk_price DECIMAL(10, 2),
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items table (Many-to-Many)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data for Products
INSERT INTO products (name, category, description, image_url, price_per_unit, unit_type, bulk_price, in_stock)
VALUES 
('Bulk Potatoes', 'vegetable', 'Premium quality bulk potatoes perfect for mashing, roasting, or frying.', '/images/bulk-potatoes.png', 12.50, '10kg bag', 11.00, true),
('Tomatoes (Class 1)', 'vegetable', 'Fresh, red, vine-ripened tomatoes. Great for salads and sauces.', 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&q=80', 25.00, 'box', 22.50, true),
('White Onions', 'vegetable', 'Large white onions, essential for any kitchen base.', '/images/white-onions.png', 15.00, '10kg bag', 13.50, true),
('Bananas', 'fruit', 'Sweet and perfectly ripe yellow bananas.', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80', 18.00, 'box', 16.00, true),
('Granny Smith Apples', 'fruit', 'Crisp, tart green apples.', '/images/granny-smith-apples.png', 35.00, 'box', 32.00, true),
('Carrots', 'vegetable', 'Freshly harvested crunchy orange carrots.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', 14.00, '10kg bag', 12.00, true),
('Lettuce (Iceberg)', 'vegetable', 'Crisp heads of iceberg lettuce.', '/images/iceberg-lettuce.png', 12.00, 'box', 10.00, true),
('Oranges (Navel)', 'fruit', 'Juicy, sweet navel oranges.', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80', 28.00, 'box', 25.00, true);
