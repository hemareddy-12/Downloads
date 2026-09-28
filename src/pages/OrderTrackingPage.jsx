import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Scissors, 
  AlertCircle,
  MessageCircle 
} from 'lucide-react';
import { getOrderByIdOrCode } from '../services/orderService';
import { useBrand } from '../context/BrandContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { brandSettings } = useBrand();
  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const social = brandSettings?.socialLinks || {};

  const STATUS_STEPS = [
    { key: 'Pending', label: 'Order Received', desc: 'Order logged into atelier system' },
    { key: 'Confirmed', label: 'Order Confirmed', desc: 'Fabric reserved & measurements reviewed' },
    { key: 'Processing', label: 'Crafting & Tailoring', desc: 'Master needlework, hand-embroidery & stitching' },
    { key: 'Ready', label: 'Quality Inspected', desc: 'Finished silhouette verified by Hema Reddy' },
    { key: 'Shipped', label: 'Dispatched', desc: 'Handed over to express luxury courier' },
    { key: 'Delivered', label: 'Delivered', desc: 'Safely delivered to patron' },
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const found = await getOrderByIdOrCode(searchId.trim());
      if (found) {
        setOrder(found);
        setSearchParams({ id: searchId.trim() });
      } else {
        setOrder(null);
        setError(`No order found matching reference "${searchId.trim()}". Please check your Order ID.`);
      }
    } catch (err) {
      setError('Unable to fetch order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get('id');
    if (initialId) {
      setSearchId(initialId);
      handleSearch();
    }
  }, []);

  const getStepStatus = (stepKey) => {
    if (!order) return 'upcoming';
    if (order.orderStatus === 'Cancelled') return 'cancelled';

    const orderStatusIdx = STATUS_STEPS.findIndex(s => s.key.toLowerCase() === order.orderStatus?.toLowerCase());
    const currentStepIdx = STATUS_STEPS.findIndex(s => s.key.toLowerCase() === stepKey.toLowerCase());

    if (orderStatusIdx === -1) {
      // Default to pending
      return currentStepIdx === 0 ? 'active' : 'upcoming';
    }

    if (currentStepIdx < orderStatusIdx) return 'completed';
    if (currentStepIdx === orderStatusIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
          Live Atelier Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
          Track Your Couture Order
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-light">
          Enter your Order Reference ID (e.g. LHR-XXXXX) provided at checkout or in your confirmation.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Package className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. LHR-00123"
              className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm text-center">
          {error}
        </div>
      )}

      {/* Tracking Result View */}
      {order && (
        <div className="bg-white border border-gold-200 rounded-sm p-6 sm:p-10 shadow-luxury space-y-8 animate-fade-in">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gold-100 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-charcoal-400">Order ID:</span>
              <h2 className="font-mono text-xl font-bold text-gold-900">{order.orderId}</h2>
              <span className="text-xs text-charcoal-500">
                Patron: {order.customerName} • Placed {formatDateTime(order.createdAt)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-charcoal-400 block">Current Status:</span>
              <span className="inline-block px-3 py-1 bg-gold-100 text-gold-900 border border-gold-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <h3 className="font-serif text-base text-charcoal-900 mb-6">Atelier Progress Workflow</h3>
            
            <div className="relative border-l-2 border-gold-200 ml-4 pl-6 space-y-8">
              {STATUS_STEPS.map((step, idx) => {
                const status = getStepStatus(step.key);

                return (
                  <div key={step.key} className="relative group">
                    {/* Step Icon */}
                    <div 
                      className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : status === 'active'
                          ? 'bg-gold-600 text-white ring-4 ring-gold-200'
                          : 'bg-charcoal-100 text-charcoal-400'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs uppercase tracking-wider font-semibold ${
                          status === 'active' 
                            ? 'text-gold-900' 
                            : status === 'completed' 
                            ? 'text-charcoal-900' 
                            : 'text-charcoal-400'
                        }`}>
                          {step.label}
                        </h4>
                        {status === 'active' && (
                          <span className="text-[10px] bg-gold-600 text-white px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-500 font-light">{step.desc}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details Footer */}
          <div className="pt-6 border-t border-gold-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-charcoal-600">
            <div>
              <span>Delivery Destination: </span>
              <strong className="text-charcoal-900">{order.address}</strong>
            </div>

            <a
              href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20Hema%20Reddy,%20inquiring%20about%20Order%20${order.orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold-800 hover:text-gold-950 font-semibold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Contact Hema Reddy regarding this order</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
};
