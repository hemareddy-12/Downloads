import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer = () => {
  const { 
    isDrawerOpen, 
    setIsDrawerOpen, 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartSubtotal 
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-gold-200">
          
          {/* Header */}
          <div className="p-6 border-b border-gold-200/70 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-700" />
              <h2 className="font-serif text-lg tracking-wider text-charcoal-900 uppercase">
                Shopping Bag ({cartItems.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-900 transition rounded-full hover:bg-gold-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg text-charcoal-800">Your bag is currently empty</h3>
                <p className="text-xs text-charcoal-500 max-w-xs leading-relaxed">
                  Discover our curated collection of pure silk sarees, festive half-sarees, and made-to-order couture.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-2 bg-charcoal-900 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest px-6 py-3 rounded-sm transition-colors font-medium shadow-sm"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const { product, quantity, size, color, customNotes, price } = item;
                const image = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300';

                return (
                  <div 
                    key={`${product.id}-${size}-${index}`}
                    className="flex gap-4 p-3 bg-white rounded-sm border border-gold-100/80 shadow-sm"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="w-20 h-24 object-cover object-top rounded-sm border border-charcoal-100 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => setIsDrawerOpen(false)}
                            className="font-serif text-xs font-medium text-charcoal-900 hover:text-gold-700 transition line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(index)}
                            className="text-charcoal-400 hover:text-red-600 p-1 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-charcoal-500 space-y-0.5 mt-1">
                          {size && <div>Size: <span className="text-charcoal-800 font-medium">{size}</span></div>}
                          {color && <div>Color: <span className="text-charcoal-800 font-medium">{color}</span></div>}
                          {customNotes && (
                            <div className="text-[10px] text-gold-700 italic truncate max-w-[200px]">
                              Note: {customNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gold-50 mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-charcoal-200 rounded-sm">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, quantity - 1)}
                            className="p-1 text-charcoal-600 hover:bg-gold-50 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-charcoal-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, quantity + 1)}
                            className="p-1 text-charcoal-600 hover:bg-gold-50 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-semibold text-charcoal-900">
                          {formatCurrency(price * quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-gold-200 space-y-4">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-sm text-charcoal-900">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>
              <p className="text-[11px] text-gold-700">
                * Taxes calculated at checkout. Complimentary domestic & international shipping available.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-50 text-xs uppercase tracking-widest font-medium py-3 rounded-sm transition"
                >
                  View Bag
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
