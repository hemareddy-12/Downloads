import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  if (!product) return null;

  const {
    id,
    name,
    categoryName,
    price,
    discountPrice,
    images = [],
    isNew,
    isFeatured,
    inStock = true,
    stock = 1,
  } = product;

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
  const secondaryImage = images[1] || primaryImage;
  const isWishlisted = isInWishlist(id);

  const discountPercent = discountPrice && price > discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'Free Size');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div 
      className="group relative flex flex-col bg-white/80 rounded-sm border border-gold-100/70 hover:border-gold-300 hover:shadow-luxury transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal-50 block">
        {/* Primary & Hover Image */}
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="bg-charcoal-900 text-gold-200 text-[10px] tracking-widest font-semibold uppercase px-2 py-0.5 rounded-sm shadow-sm">
              New Drop
            </span>
          )}
          {isFeatured && (
            <span className="bg-gold-600 text-white text-[10px] tracking-widest font-semibold uppercase px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-600 text-white text-[10px] tracking-widest font-bold uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {discountPercent}% Off
            </span>
          )}
          {(!inStock || stock <= 0) && (
            <span className="bg-charcoal-700 text-white text-[10px] tracking-widest font-semibold uppercase px-2 py-0.5 rounded-sm shadow-sm">
              Made to Order
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-brand-50 text-brand-600 shadow-sm'
              : 'bg-white/80 text-charcoal-700 hover:text-brand-600 hover:bg-white'
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-brand-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 bg-[#FAF8F5] hover:bg-gold-50 text-charcoal-900 text-xs font-semibold py-2 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-gold-700" />
            <span>Add to Bag</span>
          </button>
          <Link
            to={`/product/${id}`}
            className="bg-white/90 hover:bg-white text-charcoal-900 p-2 rounded-sm transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </Link>

      {/* Product Details info */}
      <div className="p-4 flex flex-col flex-1">
        {categoryName && (
          <span className="text-[10px] tracking-widest-luxury uppercase text-gold-700 font-semibold mb-1">
            {categoryName}
          </span>
        )}
        
        <Link 
          to={`/product/${id}`}
          className="font-serif text-sm md:text-base font-normal text-charcoal-900 group-hover:text-gold-800 transition-colors line-clamp-2 leading-snug mb-2"
        >
          {name}
        </Link>

        {/* Pricing */}
        <div className="mt-auto pt-2 flex items-baseline gap-2.5">
          {discountPrice ? (
            <>
              <span className="font-semibold text-charcoal-950 text-sm md:text-base">
                {formatCurrency(discountPrice)}
              </span>
              <span className="text-xs text-charcoal-400 line-through">
                {formatCurrency(price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-charcoal-950 text-sm md:text-base">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
