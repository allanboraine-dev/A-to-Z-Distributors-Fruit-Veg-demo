import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

// Fallback seed data in case Supabase is not yet connected
const mockProducts: Product[] = [
  { id: '1', name: 'Bulk Potatoes', category: 'vegetable', description: 'Premium quality bulk potatoes perfect for mashing, roasting, or frying.', image_url: '/images/bulk-potatoes.png', price_per_unit: 12.50, unit_type: '10kg bag', bulk_price: 11.00, in_stock: true },
  { id: '2', name: 'Tomatoes (Class 1)', category: 'vegetable', description: 'Fresh, red, vine-ripened tomatoes. Great for salads and sauces.', image_url: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&q=80', price_per_unit: 25.00, unit_type: 'box', bulk_price: 22.50, in_stock: true },
  { id: '3', name: 'White Onions', category: 'vegetable', description: 'Large white onions, essential for any kitchen base.', image_url: '/images/white-onions.png', price_per_unit: 15.00, unit_type: '10kg bag', bulk_price: 13.50, in_stock: true },
  { id: '4', name: 'Bananas', category: 'fruit', description: 'Sweet and perfectly ripe yellow bananas.', image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80', price_per_unit: 18.00, unit_type: 'box', bulk_price: 16.00, in_stock: true },
  { id: '5', name: 'Granny Smith Apples', category: 'fruit', description: 'Crisp, tart green apples.', image_url: '/images/granny-smith-apples.png', price_per_unit: 35.00, unit_type: 'box', bulk_price: 32.00, in_stock: true },
  { id: '6', name: 'Carrots', category: 'vegetable', description: 'Freshly harvested crunchy orange carrots.', image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', price_per_unit: 14.00, unit_type: '10kg bag', bulk_price: 12.00, in_stock: true },
  { id: '7', name: 'Lettuce (Iceberg)', category: 'vegetable', description: 'Crisp heads of iceberg lettuce.', image_url: '/images/iceberg-lettuce.png', price_per_unit: 12.00, unit_type: 'box', bulk_price: 10.00, in_stock: true },
  { id: '8', name: 'Oranges (Navel)', category: 'fruit', description: 'Juicy, sweet navel oranges.', image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80', price_per_unit: 28.00, unit_type: 'box', bulk_price: 25.00, in_stock: true },
];

export const revalidate = 60; // Revalidate every minute

// Image fallback map for broken Unsplash URLs
const localImageMap: Record<string, string> = {
  'Bulk Potatoes': '/images/bulk-potatoes.png',
  'Granny Smith Apples': '/images/granny-smith-apples.png',
  'Lettuce (Iceberg)': '/images/iceberg-lettuce.png',
  'White Onions': '/images/white-onions.png',
};

export default async function Home() {
  let products: Product[] = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) throw error;
    if (data && data.length > 0) {
      // Intercept missing/broken images from DB and map to local images
      products = data.map(product => ({
        ...product,
        image_url: localImageMap[product.name] || product.image_url
      }));
    } else {
      products = mockProducts; // Fallback to mock if table is empty
    }
  } catch (error) {
    console.warn('Supabase fetch failed, using mock data:', error);
    products = mockProducts;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
        <Image
          src="/hero-storefront.jpg"
          alt="A to Z Distributors Storefront"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent flex items-center">
          <div className="p-8 md:p-12 lg:p-16 max-w-2xl text-white">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold tracking-wider uppercase mb-4 border border-emerald-500/30">
              Wholesale Fruit & Veg
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              A to Z Distributors
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 font-light max-w-lg">
              We supply happiness, while stocks lasts... Fresh, high-quality produce for your business.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-600/30">
                Order Online
              </div>
              <div className="px-6 py-3.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 backdrop-blur-sm">
                Call: 082 253 1954
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="products">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Our Produce
            </h2>
            <p className="mt-1 text-gray-500">
              Browse our current wholesale inventory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
