"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product, Order } from '@/types';
import { Loader2, Package, CheckCircle, Clock, XCircle, Truck, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const [newProduct, setNewProduct] = useState({
    name: '', category: 'vegetable', description: '', image_url: '', price_per_unit: '', unit_type: '1kg', bulk_price: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      description: product.description || '',
      image_url: product.image_url || '',
      price_per_unit: product.price_per_unit.toString(),
      unit_type: product.unit_type,
      bulk_price: product.bulk_price ? product.bulk_price.toString() : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setNewProduct({ name: '', category: 'vegetable', description: '', image_url: '', price_per_unit: '', unit_type: '1kg', bulk_price: '' });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: productsData, error: pError } = await supabase.from('products').select('*').order('name');
      if (!pError && productsData) setProducts(productsData);

      const { data: ordersData, error: oError } = await supabase
        .from('orders')
        .select(`*, profiles ( business_name, contact_name, phone )`)
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
      setProducts(products.map(p => p.id === productId ? { ...p, in_stock: !currentStatus } : p));
      const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', productId);
      if (error) throw error;
      toast.success('Stock status updated');
    } catch (error) {
      setProducts(products.map(p => p.id === productId ? { ...p, in_stock: currentStatus } : p));
      toast.error('Failed to update stock status.');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      toast.success('Order status updated');
    } catch (error) {
      fetchData();
      toast.error('Failed to update order status.');
    }
  };

  const handleClearOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to permanently clear this order?')) return;
    
    try {
      // Delete items first (foreign key constraint)
      await supabase.from('order_items').delete().eq('order_id', orderId);
      
      // Delete order
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Order cleared successfully');
    } catch (error: any) {
      console.error('Error clearing order:', error);
      toast.error('Failed to clear order.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    
    const payload = {
      name: newProduct.name,
      category: newProduct.category,
      description: newProduct.description,
      image_url: newProduct.image_url || null,
      price_per_unit: Number(newProduct.price_per_unit),
      unit_type: newProduct.unit_type,
      bulk_price: newProduct.bulk_price ? Number(newProduct.bulk_price) : null,
    };

    try {
      if (editingProductId) {
        // Update existing product
        const { error } = await supabase.from('products').update(payload).eq('id', editingProductId);
        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        // Insert new product
        const { error } = await supabase.from('products').insert([{ ...payload, in_stock: true }]);
        if (error) throw error;
        toast.success('Product added successfully!');
      }
      
      // Refresh inventory and reset form
      fetchData();
      cancelEdit();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsAddingProduct(false);
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
                          <div className="flex items-center justify-end gap-2">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2"
                            >
                              <option value="pending">Pending</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleClearOrder(order.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Clear Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Inventory & Add Product */}
        <div className="space-y-8">
          
          {/* Add/Edit Product Form */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {editingProductId ? <><Edit2 size={20} className="text-blue-600" /> Edit Product</> : <><Plus size={20} className="text-emerald-600" /> Add New Product</>}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Red Apples" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type</label>
                  <input required type="text" value={newProduct.unit_type} onChange={e => setNewProduct({...newProduct, unit_type: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. 1kg box" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (R)</label>
                  <input required type="number" step="0.01" value={newProduct.price_per_unit} onChange={e => setNewProduct({...newProduct, price_per_unit: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="15.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bulk Price (R)</label>
                  <input type="number" step="0.01" value={newProduct.bulk_price} onChange={e => setNewProduct({...newProduct, bulk_price: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="/images/my-image.png or https://..." />
              </div>
              <div className="flex gap-2">
                <button disabled={isAddingProduct} type="submit" className={`flex-1 ${editingProductId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-medium py-2 rounded-lg text-sm transition-colors flex justify-center disabled:opacity-70`}>
                  {isAddingProduct ? <Loader2 className="animate-spin" size={20} /> : (editingProductId ? 'Update Product' : 'Save Product')}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Inventory Status</h2>
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {products.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No products found.</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500">R{product.price_per_unit.toFixed(2)} / {product.unit_type}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEditProduct(product)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
