import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Scissors,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl text-charcoal-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
          Explore our signature collection of handwoven sarees, bespoke half-sarees, and custom-stitched bridal ensembles.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest px-8 py-3.5 rounded-sm font-medium transition shadow-sm"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const shipping = cartSubtotal >= 25000 ? 0 : 500;
  const grandTotal = cartSubtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Title */}
      <div className="border-b border-gold-200/70 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
            Review Your Selections
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
            Shopping Bag ({cartItems.length} {cartItems.length === 1 ? 'Design' : 'Designs'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-charcoal-400 hover:text-red-600 underline transition self-start sm:self-auto"
        >
          Clear Entire Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item, index) => {
            const { product, quantity, size, color, customNotes, price } = item;
            const image = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400';

            return (
              <div 
                key={`${product.id}-${size}-${index}`}
                className="flex flex-col sm:flex-row items-start gap-5 p-4 sm:p-6 bg-white rounded-sm border border-gold-100 shadow-sm"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-24 h-32 sm:w-28 sm:h-36 object-cover object-top rounded-sm border border-charcoal-100 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-serif text-base sm:text-lg font-normal text-charcoal-900 hover:text-gold-700 transition"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-charcoal-400 hover:text-red-600 transition p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {product.categoryName && (
                      <span className="text-[10px] uppercase tracking-wider text-gold-700 font-medium block mt-0.5">
                        {product.categoryName}
                      </span>
                    )}

                    <div className="mt-2 text-xs text-charcoal-600 space-y-1">
                      {size && <div>Size / Fit: <span className="font-medium text-charcoal-900">{size}</span></div>}
                      {color && <div>Color: <span className="font-medium text-charcoal-900">{color}</span></div>}
                      {customNotes && (
                        <div className="p-2 bg-gold-50/70 border border-gold-200/50 rounded-sm text-[11px] text-charcoal-700 flex items-start gap-1.5 mt-2">
                          <Scissors className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                          <span>Custom Stitching Note: {customNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gold-50">
                    {/* Quantity counter */}
                    <div className="flex items-center border border-charcoal-200 rounded-sm bg-[#FAF8F5]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, quantity - 1)}
                        className="p-1.5 px-3 text-charcoal-600 hover:bg-gold-50 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-charcoal-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, quantity + 1)}
                        className="p-1.5 px-3 text-charcoal-600 hover:bg-gold-50 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-charcoal-950">
                        {formatCurrency(price * quantity)}
                      </div>
                      <div className="text-[10px] text-charcoal-400">
                        {formatCurrency(price)} each
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-charcoal-700 hover:text-gold-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-sm border border-gold-200/80 shadow-card space-y-6 sticky top-28">
            <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-200/60 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
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

              {shipping > 0 && (
                <div className="p-2.5 bg-gold-50/60 border border-gold-200/50 rounded-sm text-[11px] text-gold-800 leading-snug">
                  Add {formatCurrency(25000 - cartSubtotal)} more for complimentary domestic express shipping.
                </div>
              )}

              <div className="border-t border-gold-200 pt-3 flex justify-between text-sm font-semibold text-charcoal-950">
                <span>Total Amount</span>
                <span className="font-serif text-lg text-gold-900">{formatCurrency(grandTotal)}</span>
              </div>
              <p className="text-[10px] text-charcoal-400">Includes all applicable GST & luxury handling charges.</p>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-charcoal-950 hover:bg-gold-700 text-gold-100 py-4 px-6 rounded-sm text-xs uppercase tracking-widest font-semibold transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 border-t border-gold-100 space-y-2 text-[11px] text-charcoal-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>Express courier delivery within 3-7 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>Direct artisan guarantee from Hema Reddy</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
