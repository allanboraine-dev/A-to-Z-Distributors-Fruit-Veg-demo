export interface Product {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable' | 'other';
  description: string;
  image_url: string;
  price_per_unit: number;
  unit_type: string;
  bulk_price: number | null;
  in_stock: boolean;
  created_at?: string;
}

export interface Profile {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  delivery_address: string | null;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'dispatched' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_notes: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at?: string;
  product?: Product;
}

export interface CartItem extends Product {
  quantity: number;
}
