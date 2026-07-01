"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  badge?: string;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
    setQuantity(1); // reset after adding
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* Image Container with strict Next.js Image rules */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-medium text-sm">
              Out of Stock
            </span>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 border border-white/20 animate-[pulse_3s_ease-in-out_infinite]">
            {badge}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">{product.name}</h3>
          <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{product.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-end">
            <span className="text-gray-500 text-sm">Standard (per {product.unit_type})</span>
            <span className="font-bold text-gray-900">R{product.price_per_unit.toFixed(2)}</span>
          </div>
          {product.bulk_price && (
            <div className="flex justify-between items-end text-emerald-600">
              <span className="text-sm font-medium">Bulk (10+ {product.unit_type}s)</span>
              <span className="font-bold">R{product.bulk_price.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!product.in_stock}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              disabled={!product.in_stock}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={!product.in_stock}
            className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-emerald-600 hover:to-emerald-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
