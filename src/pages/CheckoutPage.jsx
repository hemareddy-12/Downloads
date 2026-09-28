import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  ArrowLeft, 
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping form fields
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    paymentMethod: 'UPI / Bank Transfer',
    orderNotes: '',
  });

  const shipping = cartSubtotal >= 25000 ? 0 : 500;
  const grandTotal = cartSubtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-charcoal-900">Your bag is empty</h2>
        <p className="text-xs text-charcoal-500">Add pieces to your bag before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-block bg-charcoal-900 text-gold-100 px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-medium"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.address || !formData.city || !formData.pinCode) {
      setError('Please fill in all required shipping and contact details.');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pinCode}, ${formData.country}`,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          customNotes: item.customNotes,
          image: item.product.images?.[0] || '',
        })),
        subtotal: cartSubtotal,
        shippingFee: shipping,
        totalAmount: grandTotal,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'Pending Verification',
        orderStatus: 'Pending',
        orderNotes: formData.orderNotes,
      };

      const created = await createOrder(orderPayload);
      clearCart();
      navigate(`/order-confirmation/${created.orderId}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      setError('Unable to place order at this moment. Please check details or contact us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-charcoal-600 hover:text-gold-700 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping Bag</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
          Checkout & Shipping
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Shipping and Contact Information */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Contact Details */}
          <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-sm space-y-4">
            <h3 className="font-serif text-base uppercase tracking-wider text-charcoal-900 border-b border-gold-100 pb-2">
              1. Contact Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Reddy"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="ananya@example.com"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-sm space-y-4">
            <h3 className="font-serif text-base uppercase tracking-wider text-charcoal-900 border-b border-gold-100 pb-2">
              2. Shipping Destination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Street Address & Apartment / Landmark *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat 402, Royal Palms, Road No. 12, Banjara Hills"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Telangana"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  PIN / Postal Code *
                </label>
                <input
                  type="text"
                  name="pinCode"
                  required
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="500034"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 border border-gold-200 rounded-sm bg-charcoal-50 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Special Delivery or Custom Stitching Notes (Optional)
                </label>
                <textarea
                  name="orderNotes"
                  rows={2}
                  value={formData.orderNotes}
                  onChange={handleChange}
                  placeholder="Any specific delivery instructions, event dates, or sizing details..."
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-sm space-y-4">
            <h3 className="font-serif text-base uppercase tracking-wider text-charcoal-900 border-b border-gold-100 pb-2">
              3. Payment Preference
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 border border-gold-200 rounded-sm cursor-pointer hover:bg-gold-50/50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI / Bank Transfer"
                  checked={formData.paymentMethod === 'UPI / Bank Transfer'}
                  onChange={handleChange}
                  className="mt-0.5 accent-gold-700"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">UPI / Net Banking / Wire Transfer</span>
                  <span className="text-[11px] text-charcoal-500">
                    Payment details will be shared on the order confirmation screen & WhatsApp for instant zero-fee transfer.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gold-200 rounded-sm cursor-pointer hover:bg-gold-50/50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={formData.paymentMethod === 'Cash on Delivery'}
                  onChange={handleChange}
                  className="mt-0.5 accent-gold-700"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Cash on Delivery (Available in select metro pin codes)</span>
                  <span className="text-[11px] text-charcoal-500">
                    Verified via phone call before dispatch.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gold-200 rounded-sm cursor-pointer hover:bg-gold-50/50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Consultation First"
                  checked={formData.paymentMethod === 'Consultation First'}
                  onChange={handleChange}
                  className="mt-0.5 accent-gold-700"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">WhatsApp Atelier Confirmation</span>
                  <span className="text-[11px] text-charcoal-500">
                    Hema Reddy's studio will contact you directly to confirm measurements before initiating payment.
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Review */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-sm border border-gold-200 shadow-card space-y-6 sticky top-28">
            <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-200 pb-3">
              Order Review ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Compact items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'}
                    alt=""
                    className="w-12 h-16 object-cover object-top rounded-sm border border-charcoal-100 shrink-0"
                  />
                  <div className="flex-1">
                    <h5 className="font-serif font-medium text-charcoal-900 line-clamp-1">{item.product.name}</h5>
                    <div className="text-[11px] text-charcoal-500">
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                    </div>
                    {item.customNotes && (
                      <div className="text-[10px] text-gold-700 italic truncate max-w-[200px]">
                        Custom: {item.customNotes}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-charcoal-950">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-gold-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Shipping & Insurance</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase">Complimentary</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              <div className="border-t border-gold-200 pt-3 flex justify-between text-base font-semibold text-charcoal-950">
                <span>Total Due</span>
                <span className="font-serif text-lg text-gold-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal-950 hover:bg-gold-700 disabled:bg-charcoal-400 text-gold-100 py-4 px-6 rounded-sm text-xs uppercase tracking-widest font-semibold transition shadow-luxury flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-gold-400" />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal-500">
              <Lock className="w-3.5 h-3.5 text-gold-600" />
              <span>Encrypted & Protected by Label HemaReddy Atelier</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};
