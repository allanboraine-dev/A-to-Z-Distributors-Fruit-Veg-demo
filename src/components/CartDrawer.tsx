"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const supabase = createClient();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to place an order.');
        setIsSubmitting(false);
        return;
      }
      
      // Check if profile exists, and if not, create it
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, business_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
      }

      let currentBusinessName = profile?.business_name || user.user_metadata?.business_name || user.email?.split('@')[0] || 'Valued Customer';

      if (!profile) {
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            business_name: currentBusinessName,
            role: 'customer'
          });
        if (insertProfileError) {
          console.error('Failed to create profile on checkout:', insertProfileError);
        }
      }
      
      // Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.bulk_price && item.quantity >= 10 ? item.bulk_price : item.price_per_unit
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate WhatsApp Message
      let message = `*New Wholesale Order*\n`;
      message += `From: ${currentBusinessName}\n`;
      message += `Order ID: #${orderData.id.slice(0, 8)}\n\n`;
      message += `*Items:*\n`;
      cart.forEach(item => {
        const price = item.bulk_price && item.quantity >= 10 ? item.bulk_price : item.price_per_unit;
        message += `- ${item.quantity}x ${item.name} (R${price.toFixed(2)})\n`;
      });
      message += `\n*Total: R${cartTotal.toFixed(2)}*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/27822531954?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');

      setOrderSuccess(true);
      clearCart();
      
      // Close drawer after 3 seconds on success
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error during checkout details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        error: error
      });
      toast.error(`Checkout failed: ${error?.message || 'Please try again or login if required.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-gray-900" />
            <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orderSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Order Placed!</h3>
              <p className="text-gray-500">Your wholesale order has been received and is pending dispatch.</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingBag size={48} />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some products to build your order.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        R{item.bulk_price && item.quantity >= 10 ? item.bulk_price.toFixed(2) : item.price_per_unit.toFixed(2)} / {item.unit_type}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!orderSuccess && cart.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-600">Total</span>
              <span className="font-bold text-gray-900 text-2xl">R{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              By placing this order, you agree to our wholesale terms of service.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
