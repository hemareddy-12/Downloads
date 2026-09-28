import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { getOrderByIdOrCode } from '../services/orderService';
import { useBrand } from '../context/BrandContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { brandSettings } = useBrand();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const brandName = brandSettings?.brandName || 'Label HemaReddy';
  const social = brandSettings?.socialLinks || {};

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const found = await getOrderByIdOrCode(orderId);
        if (found) setOrder(found);
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      
      {/* Success Hero Card */}
      <div className="bg-white border border-gold-200 rounded-sm p-8 sm:p-12 shadow-luxury text-center space-y-6">
        
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
            Thank You for Patronising {brandName}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
            Your Order Has Been Placed
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed font-light">
            Our atelier will begin handcrafting and preparing your bespoke pieces with utmost care.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-[#FAF8F5] border border-gold-200/80 p-4 rounded-sm inline-block w-full max-w-md">
          <div className="text-[11px] uppercase tracking-wider text-charcoal-500 mb-1">
            Official Order Reference ID
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-charcoal-900 tracking-wide text-gold-900">
            {orderId}
          </div>
          {order?.createdAt && (
            <div className="text-[11px] text-charcoal-500 mt-1">
              Placed on {formatDateTime(order.createdAt)}
            </div>
          )}
        </div>

        {/* Order Details Breakdown if loaded */}
        {order && (
          <div className="text-left border-t border-gold-100 pt-6 space-y-4">
            <h3 className="font-serif text-base text-charcoal-900">
              Customer & Delivery Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-700">
              <div>
                <span className="text-charcoal-400 block mb-0.5">Customer:</span>
                <span className="font-medium text-charcoal-900">{order.customerName}</span>
                <div>{order.customerPhone}</div>
                <div>{order.customerEmail}</div>
              </div>

              <div>
                <span className="text-charcoal-400 block mb-0.5">Shipping Address:</span>
                <p className="font-medium text-charcoal-900 leading-relaxed">{order.address}</p>
              </div>
            </div>

            {/* Ordered Items Preview */}
            <div className="pt-2 border-t border-gold-50">
              <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold block mb-2">
                Pieces in Order:
              </span>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#FAF8F5] rounded-sm">
                    <div>
                      <span className="font-medium text-charcoal-900">{item.name}</span>
                      <span className="text-charcoal-500 ml-2">x{item.quantity} ({item.size})</span>
                    </div>
                    <span className="font-semibold text-charcoal-950">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 text-sm font-semibold text-charcoal-950">
                <span>Total Paid / Due:</span>
                <span className="font-serif text-lg text-gold-900">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

          </div>
        )}

        {/* Next Steps & Support Buttons */}
        <div className="pt-6 border-t border-gold-200/60 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/track-order?id=${orderId}`}
            className="w-full sm:w-auto bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-3.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Progress</span>
          </Link>

          <a
            href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20Hema%20Reddy,%20I%20have%20placed%20order%20${orderId}.%20Can%20you%20confirm%20details?`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto border border-gold-400 bg-gold-50/70 hover:bg-gold-100 text-gold-900 px-6 py-3.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Atelier</span>
          </a>
        </div>

        <div className="pt-2">
          <Link
            to="/shop"
            className="text-xs uppercase tracking-wider text-charcoal-500 hover:text-gold-700 underline"
          >
            Continue Browsing More Collections
          </Link>
        </div>

      </div>

    </div>
  );
};
