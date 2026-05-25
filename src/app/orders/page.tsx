import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Order, OrderItem } from '@/types';

// Extend Order type to include items for this view
interface OrderWithItems extends Order {
  order_items: (OrderItem & { products: { name: string, unit_type: string } })[];
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'pending': return <Clock size={16} className="text-amber-500" />;
    case 'dispatched': return <Truck size={16} className="text-blue-500" />;
    case 'delivered': return <CheckCircle size={16} className="text-emerald-500" />;
    case 'cancelled': return <XCircle size={16} className="text-red-500" />;
    default: return null;
  }
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_time,
        products (
          name,
          unit_type
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500">Track your past and current wholesale orders.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-medium text-gray-900">R{order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order #</p>
                  <p className="text-sm font-mono text-gray-900">{order.id.split('-')[0]}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize text-gray-700">{order.status}</span>
                </div>
              </div>
              
              <div className="p-4 sm:px-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Items</h4>
                <ul className="divide-y divide-gray-100">
                  {order.order_items?.map((item: any) => (
                    <li key={item.id} className="py-3 flex justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                        <span className="text-gray-600">{item.products?.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">R{(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
