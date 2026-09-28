import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  X, 
  Check, 
  Clock, 
  Truck, 
  Scissors, 
  MessageCircle, 
  Filter 
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [success, setSuccess] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      setSuccess(`Order status updated to "${newStatus}"`);
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handlePaymentUpdate = async (orderId, newPaymentStatus) => {
    try {
      await updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
      setSuccess(`Payment status updated to "${newPaymentStatus}"`);
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Failed to update payment status:', e);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = !search || 
      o.orderId?.toLowerCase().includes(search.toLowerCase()) || 
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Track order stages, update courier dispatch statuses, and inspect custom sizing requests.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, name, phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gold-200 text-xs rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-charcoal-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gold-200 text-charcoal-800 text-xs py-2 px-3 rounded-sm focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gold-200 rounded-sm shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-gold-100 text-charcoal-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">View / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal-400">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id || order.orderId} className="hover:bg-[#FAF8F5]/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-gold-900">{order.orderId}</div>
                      <div className="text-[10px] text-charcoal-400">{formatDateTime(order.createdAt)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-charcoal-900">{order.customerName}</div>
                      <div className="text-[10px] text-charcoal-500">{order.customerPhone}</div>
                      <div className="text-[10px] text-charcoal-400 truncate max-w-[150px]">{order.customerEmail}</div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-700">
                      <div>{order.items?.length || 0} pieces</div>
                      <div className="text-[10px] text-charcoal-400 line-clamp-1">
                        {order.items?.[0]?.name}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-charcoal-950">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded border focus:outline-none ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.orderStatus === 'Processing'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : order.orderStatus === 'Confirmed'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-gold-50 text-gold-900 border-gold-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready">Ready</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] text-charcoal-600 block">{order.paymentMethod}</span>
                      <select
                        value={order.paymentStatus || 'Pending Verification'}
                        onChange={(e) => handlePaymentUpdate(order.id, e.target.value)}
                        className="text-[10px] bg-white border border-charcoal-200 rounded px-1.5 py-0.5 mt-0.5"
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified / Paid">Verified / Paid</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Failed / Cancelled">Failed / Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-charcoal-900 hover:bg-gold-700 text-gold-100 px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gold-300 w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in text-xs max-h-[85vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold-200 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-400">Order Dossier</span>
                <h3 className="font-mono text-xl font-bold text-gold-900">{selectedOrder.orderId}</h3>
                <span className="text-[11px] text-charcoal-500">Placed on {formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-charcoal-400 hover:text-charcoal-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-[#FAF8F5] p-4 rounded-sm border border-gold-100 space-y-2">
              <h4 className="font-serif text-sm text-charcoal-900">Customer & Shipping Information</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-charcoal-400 block">Name:</span>
                  <span className="font-semibold text-charcoal-900">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">Phone:</span>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="font-semibold text-gold-800 hover:underline">
                    {selectedOrder.customerPhone}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-charcoal-400 block">Email:</span>
                  <span className="text-charcoal-800">{selectedOrder.customerEmail}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-charcoal-400 block">Full Delivery Address:</span>
                  <span className="text-charcoal-800 font-medium">{selectedOrder.address}</span>
                </div>
                {selectedOrder.orderNotes && (
                  <div className="col-span-2 p-2 bg-gold-50 border border-gold-200 rounded text-gold-900">
                    <strong>Customer Notes: </strong> {selectedOrder.orderNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm text-charcoal-900">Ordered Garments</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-white border border-gold-100 rounded-sm">
                    {item.image && (
                      <img src={item.image} alt="" className="w-12 h-16 object-cover object-top rounded-sm border" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-charcoal-900">{item.name}</div>
                      <div className="text-[11px] text-charcoal-500">
                        Qty: {item.quantity} • Size: {item.size || 'Free Size'} {item.color && `• Color: ${item.color}`}
                      </div>
                      {item.customNotes && (
                        <div className="text-[11px] text-gold-800 italic mt-1">
                          Custom Stitching Request: {item.customNotes}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-charcoal-950">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gold-200 pt-3 flex justify-between items-center text-sm font-semibold">
              <span>Grand Total:</span>
              <span className="font-serif text-lg text-gold-900">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-between items-center">
              <a
                href={`https://wa.me/${selectedOrder.customerPhone?.replace(/[^0-9]/g, '')}?text=Hello%20${selectedOrder.customerName},%20this%20is%20Hema%20Reddy%20from%20Label%20HemaReddy%20regarding%20order%20${selectedOrder.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-emerald-600 text-white px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Customer on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-charcoal-900 text-gold-100 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
