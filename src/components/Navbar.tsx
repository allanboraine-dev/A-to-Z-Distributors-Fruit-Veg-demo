"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, LogOut, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
    router.refresh();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm relative">
                <Image src="/icons/icon-192x192.png" alt="A to Z Logo" fill className="object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                A to Z Distributors Fruit and Veg
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/orders" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  My Orders
                </Link>
                <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Admin
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <User size={16} />
                  Log In
                </Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 ml-2"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            {user ? (
              <>
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 text-base font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                  My Orders
                </Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 text-base font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                  Admin Panel
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 text-base font-medium text-gray-700 hover:text-emerald-600 transition-colors text-left w-full"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 text-base font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                <User size={18} />
                Log In or Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
