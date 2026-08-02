"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, ShoppingBag, Loader2, CreditCard, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Script from 'next/script';
import toast from 'react-hot-toast';
import SimulatedYocoModal from './SimulatedYocoModal';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationUser, setSimulationUser] = useState<any>(null);
  const supabase = createClient();

  const saveOrderToSupabase = async (user: any, status: string = 'pending') => {
    // Check if profile exists, and if not, create it
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, business_name')
      .eq('id', user.id)
      .maybeSingle();

    let currentBusinessName = profile?.business_name || user.user_metadata?.business_name || user.email?.split('@')[0] || 'Valued Customer';

    if (!profile) {
      await supabase.from('profiles').insert({
        id: user.id,
        business_name: currentBusinessName,
        role: 'customer'
      });
    }
    
    // Insert Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: cartTotal,
        status: status
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Filter out invalid UUIDs to prevent checkout crash from stale mock items
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCartItems = cart.filter(item => item.id && uuidRegex.test(item.id));

    if (validCartItems.length === 0) {
      throw new Error("No valid products in cart to checkout.");
    }

    // Insert Order Items
    const orderItems = validCartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.bulk_price && item.quantity >= 10 ? item.bulk_price : item.price_per_unit
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return { orderData, currentBusinessName };
  };

  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to place an order.');
        setIsSubmitting(false);
        return;
      }
      
      const { orderData, currentBusinessName } = await saveOrderToSupabase(user, 'pending');

      // Generate WhatsApp Message
      let message = `*New Wholesale Order*\nFrom: ${currentBusinessName}\nOrder ID: #${orderData.id.slice(0, 8)}\n\n*Items:*\n`;
      cart.forEach(item => {
        const price = item.bulk_price && item.quantity >= 10 ? item.bulk_price : item.price_per_unit;
        message += `- ${item.quantity}x ${item.name} (R${price.toFixed(2)})\n`;
      });
      message += `\n*Total: R${cartTotal.toFixed(2)}*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/27822531954?text=${encodedMessage}`;
      
      window.location.href = whatsappUrl;

      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);

    } catch (error: any) {
      toast.error(`Checkout failed: ${error?.message || 'Please try again or login if required.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYocoCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to place an order.');
        setIsSubmitting(false);
        return;
      }

      // Always force the simulated payment window for demo purposes
      setSimulationUser(user);
      setShowSimulationModal(true);
      return;
    } catch (error: any) {
      toast.error('Error starting checkout: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const handleSimulatedSuccess = async (token: string) => {
    setShowSimulationModal(false);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amountInCents: Math.round(cartTotal * 100),
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment failed on server');
      }

      await saveOrderToSupabase(simulationUser, 'pending');
      toast.success('Payment successful!');
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
      
    } catch (error: any) {
      toast.error('Error processing payment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Yoco Web SDK */}
      <Script src="https://js.yoco.com/sdk/v1/yoco-sdk-web.js" strategy="lazyOnload" />

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
            <div className="space-y-3">
              <button
                onClick={handleYocoCheckout}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay Online (Yoco)
                  </>
                )}
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                onClick={handleWhatsAppCheckout}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <MessageCircle size={20} />
                Order via WhatsApp
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-500 pt-2">
              By placing this order, you agree to our wholesale terms of service. Secure payments powered by Yoco.
            </p>
          </div>
        )}
      </div>

      {/* Simulated Yoco Payment Modal */}
      {showSimulationModal && (
        <SimulatedYocoModal 
          amountInCents={Math.round(cartTotal * 100)}
          onSuccess={handleSimulatedSuccess}
          onCancel={() => {
            setShowSimulationModal(false);
            setIsSubmitting(false);
          }}
        />
      )}
    </>
  );
}
