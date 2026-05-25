"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product, Order } from '@/types';
import { Loader2, Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: pError } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (!pError && productsData) setProducts(productsData);

      // Fetch orders
      const { data: ordersData, error: oError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles ( business_name, contact_name, phone )
        `)
        .order('created_at', { ascending: false });
        
      if (!oError && ordersData) setOrders(ordersData as any[]);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStock = async (productId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setProducts(products.map(p => p.id === productId ? { ...p, in_stock: !currentStatus } : p));
      
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStatus })
        .eq('id', productId);
        
      if (error) throw error;
      toast.success('Stock status updated');
    } catch (error) {
      console.error('Error updating stock:', error);
      // Revert on error
      setProducts(products.map(p => p.id === productId ? { ...p, in_stock: currentStatus } : p));
      toast.error('Failed to update stock status.');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order:', error);
      fetchData(); // Reload on error
      toast.error('Failed to update order status.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'dispatched': return <Truck size={16} className="text-blue-500" />;
      case 'delivered': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Manage your product inventory and customer orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Package className="text-gray-900" />
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                          {order.id.split('-')[0]}...
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {order.profiles?.business_name || 'Guest Customer'}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          R{order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 capitalize font-medium text-gray-700">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 ml-auto"
                          >
                            <option value="pending">Pending</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Inventory */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Inventory Status</h2>
          </div>

          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No products found.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500">R{product.price_per_unit.toFixed(2)} / {product.unit_type}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleStock(product.id, product.in_stock)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      product.in_stock ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        product.in_stock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
