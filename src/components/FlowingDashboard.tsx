"use client";

import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface FlowingDashboardProps {
  products: Product[];
  badge?: string;
}

export default function FlowingDashboard({ products, badge }: FlowingDashboardProps) {
  // We quadruple the items so the marquee animation seamlessly loops 
  // even on ultra-wide screens with a small number of mock items.
  // The animation translates by -50%, so the duplicated content ensures a seamless loop.
  const marqueeItems = [...products, ...products, ...products, ...products]; 

  return (
    <div className="relative w-full overflow-hidden py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 group">
      {/* Left/Right fading gradients for smooth flowing edges */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-orange-50 to-transparent z-10 pointer-events-none"></div>

      <div className="flex gap-6 w-max animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
        {marqueeItems.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="w-[280px] sm:w-[320px] flex-shrink-0">
            <ProductCard product={product} badge={badge} />
          </div>
        ))}
      </div>
    </div>
  );
}
