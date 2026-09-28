import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Scissors, 
  Plus, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useBrand } from '../../context/BrandContext';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { getCustomEnquiries } from '../../services/enquiryService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const AdminDashboard = () => {
  const { products } = useProducts();
  const { brandSettings } = useBrand();
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const brandName = brandSettings?.brandName || 'Label HemaReddy';

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderList, enquiryList] = await Promise.all([
        getOrders(),
        getCustomEnquiries(),
      ]);
      setOrders(orderList || []);
      setEnquiries(enquiryList || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed');
  const pendingEnquiries = enquiries.filter(e => e.status === 'New' || !e.status);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      await loadData();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Owner Studio Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
            {brandName} Dashboard
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Real-time sales, order workflow, bespoke stitching consults, and catalog inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-4 py-3 rounded-sm transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Design</span>
          </Link>
          <Link
            to="/admin/brand-settings"
            className="bg-white border border-gold-300 hover:bg-gold-50 text-charcoal-900 text-xs uppercase tracking-widest font-semibold px-4 py-3 rounded-sm transition flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-gold-600" />
            <span>Brand & Watermark</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-semibold">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-charcoal-500">Across {orders.length} placed orders</div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Orders</span>
            <div className="w-8 h-8 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-semibold">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-charcoal-500">{orders.length} total orders logged</div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Custom Stitching</span>
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-semibold">
            {pendingEnquiries.length}
          </div>
          <div className="text-[11px] text-charcoal-500">{enquiries.length} total consult requests</div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Couture Inventory</span>
            <div className="w-8 h-8 rounded-full bg-charcoal-50 text-charcoal-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-semibold">
            {products.length}
          </div>
          <div className="text-[11px] text-charcoal-500">Pieces live in catalog</div>
        </div>

      </div>

      {/* Main Two-Column View: Recent Orders & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gold-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-600" />
              <h3 className="font-serif text-lg text-charcoal-900">Recent Customer Orders</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs uppercase tracking-wider text-gold-700 hover:text-gold-900 font-semibold flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-charcoal-300" />
              <p>No customer orders placed yet. Orders will appear here as soon as patrons checkout.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-100 text-charcoal-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-50">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id || order.orderId} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 font-mono font-bold text-gold-900">
                        {order.orderId}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-charcoal-900">{order.customerName}</div>
                        <div className="text-[10px] text-charcoal-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 font-semibold text-charcoal-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'Processing'
                            ? 'bg-purple-100 text-purple-800'
                            : order.orderStatus === 'Confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gold-100 text-gold-900'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                          className="bg-white border border-gold-200 text-charcoal-800 text-[11px] py-1 px-2 rounded focus:outline-none"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Custom Stitching Consultations (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gold-100 pb-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-gold-600" />
              <h3 className="font-serif text-lg text-charcoal-900">Custom Stitching</h3>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs uppercase tracking-wider text-gold-700 hover:text-gold-900 font-semibold"
            >
              View All
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-500 space-y-2">
              <Scissors className="w-8 h-8 mx-auto text-charcoal-300" />
              <p>No bespoke consult requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.slice(0, 4).map((enq) => (
                <div key={enq.id} className="p-3 bg-[#FAF8F5] border border-gold-100 rounded-sm space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-charcoal-900">{enq.customerName}</span>
                    <span className="text-[10px] text-charcoal-400">{enq.phone}</span>
                  </div>
                  <div className="text-[11px] text-gold-800 font-medium">{enq.outfitType}</div>
                  {enq.message && (
                    <p className="text-[11px] text-charcoal-500 line-clamp-1 italic">"{enq.message}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
