import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import FlowingDashboard from '@/components/FlowingDashboard';
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

// Weekly Specials mock data
const mockSpecials: Product[] = [
  { id: 's1', name: 'Tray of Eggs (30 Large)', category: 'other', description: 'Farm fresh large eggs.', image_url: 'https://images.unsplash.com/photo-1587486913049-53fc88980fdc?w=800&q=80', price_per_unit: 85.00, unit_type: 'tray', bulk_price: 80.00, in_stock: true },
  { id: 's2', name: 'Sunflower Cooking Oil', category: 'other', description: 'Pure sunflower cooking oil, 5L.', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80', price_per_unit: 145.00, unit_type: '5L bottle', bulk_price: 135.00, in_stock: true },
  { id: 's3', name: 'Super Maize Meal', category: 'other', description: 'Premium super maize meal.', image_url: 'https://images.unsplash.com/photo-1596647185072-9b2401f11cb2?w=800&q=80', price_per_unit: 95.00, unit_type: '10kg bag', bulk_price: 89.00, in_stock: true },
  { id: 's4', name: 'White Sugar', category: 'other', description: 'Refined white sugar.', image_url: 'https://images.unsplash.com/photo-1621317585090-eec96eb15112?w=800&q=80', price_per_unit: 45.00, unit_type: '2.5kg bag', bulk_price: 42.00, in_stock: true },
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
      <div className="relative w-full flex flex-col md:block md:h-[500px] rounded-3xl overflow-hidden bg-gray-950 group">
        {/* Image Section: Aspect ratio on mobile, absolute full-cover on desktop */}
        <div className="relative w-full aspect-[21/9] md:absolute md:inset-0 overflow-hidden">
          <Image
            src="/hero-storefront.jpg"
            alt="A to Z Distributors Storefront"
            fill
            className="object-cover md:object-cover animate-[slowPan_20s_ease-in-out_infinite]"
            priority
          />
        </div>

        {/* Text Content Section: Flows below image on mobile, overlays on desktop */}
        <div className="relative md:absolute inset-0 md:bg-gradient-to-r md:from-gray-950/95 md:via-gray-900/80 md:to-transparent flex flex-col justify-end md:justify-center p-6 sm:p-8 md:p-12 lg:p-16 text-white z-10">
          <div className="max-w-2xl bg-gray-950/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-none shadow-2xl md:shadow-none -mt-16 md:mt-0 relative z-20">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3 sm:mb-4 border border-emerald-500/30">
              Wholesale Fruit & Veg
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-emerald-400">
              A to Z Distributors
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 font-light max-w-lg">
              We supply happiness, while stocks lasts... Fresh, high-quality produce for your business.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <div className="relative overflow-hidden bg-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(5,150,105,0.4)] w-full sm:w-auto text-center cursor-pointer hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] transition-all duration-300 group before:absolute before:inset-0 before:-translate-x-full hover:before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                Order Online
              </div>
              <div className="px-6 py-3.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 backdrop-blur-sm">
                Call: 082 253 1954
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Specials Dashboard Section */}
      <div id="specials" className="bg-gradient-to-br from-amber-50 to-orange-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-3xl border border-amber-100 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)] mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-amber-900 flex items-center gap-2">
              🔥 Weekly Specials
            </h2>
            <p className="mt-2 text-amber-700/80 font-medium">
              Grab these essentials at unbeatable prices!
            </p>
          </div>
        </div>
        <FlowingDashboard products={mockSpecials} badge="Wow Special!" />
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
