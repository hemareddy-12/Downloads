import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Scissors, 
  Truck, 
  ShieldCheck, 
  Ruler, 
  Check, 
  MessageCircle, 
  ArrowLeft,
  Sparkles 
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useBrand } from '../context/BrandContext';
import { formatCurrency } from '../utils/formatters';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { brandSettings } = useBrand();

  const product = products.find((p) => p.id === id);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotification, setAddedNotification] = useState(false);

  // Initialize selected size and color once product loads
  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
      setSelectedImageIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product, id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-charcoal-900">Creation Not Found</h2>
        <p className="text-xs text-charcoal-500">The design you are looking for may have been updated or moved.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-charcoal-900 text-gold-100 px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const {
    name,
    categoryName,
    category,
    price,
    discountPrice,
    images = [],
    description,
    fabric,
    details,
    care,
    customisation,
    sizes = ['Free Size'],
    colors = [],
    stock = 1,
    inStock = true,
    sku,
  } = product;

  const currentImage = images[selectedImageIndex] || images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000';
  const isWishlisted = isInWishlist(product.id);
  const discountPercent = discountPrice && price > discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === category || p.categoryName === categoryName))
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, customNotes);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor, customNotes);
    navigate('/checkout');
  };

  const whatsappText = encodeURIComponent(
    `Hello Label HemaReddy! I am interested in purchasing:\n*${name}*\nPrice: ${formatCurrency(discountPrice || price)}\nSize: ${selectedSize}\nColor: ${selectedColor}\nSKU: ${sku || ''}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center space-x-2 text-xs text-charcoal-500">
        <Link to="/" className="hover:text-gold-700 transition">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold-700 transition">Catalog</Link>
        <span>/</span>
        {categoryName && (
          <>
            <Link to={`/shop?category=${category}`} className="hover:text-gold-700 transition">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-charcoal-900 truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Large Display Image */}
          <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-charcoal-50 border border-gold-100/70 shadow-luxury">
            <img
              src={currentImage}
              alt={name}
              className="w-full h-full object-cover object-top transition-all duration-300"
            />
            
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-charcoal-900 text-gold-200 text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm shadow-sm">
                  New Arrival
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-brand-600 text-white text-xs uppercase tracking-widest font-bold px-2.5 py-1 rounded-sm shadow-sm">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition ${
                isWishlisted
                  ? 'bg-brand-50 text-brand-600'
                  : 'bg-white/80 text-charcoal-800 hover:text-brand-600 hover:bg-white'
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-brand-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-sm overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-gold-600 ring-2 ring-gold-400/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Atelier Trust Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gold-200/50 text-center">
            <div className="p-3 bg-white/60 border border-gold-100 rounded-sm space-y-1">
              <Scissors className="w-4 h-4 text-gold-600 mx-auto" />
              <div className="text-[11px] font-semibold text-charcoal-900 uppercase">Tailored Fit</div>
              <p className="text-[10px] text-charcoal-500">Custom measurements</p>
            </div>
            <div className="p-3 bg-white/60 border border-gold-100 rounded-sm space-y-1">
              <Truck className="w-4 h-4 text-gold-600 mx-auto" />
              <div className="text-[11px] font-semibold text-charcoal-900 uppercase">Global Express</div>
              <p className="text-[10px] text-charcoal-500">Insured luxury transit</p>
            </div>
            <div className="p-3 bg-white/60 border border-gold-100 rounded-sm space-y-1">
              <ShieldCheck className="w-4 h-4 text-gold-600 mx-auto" />
              <div className="text-[11px] font-semibold text-charcoal-900 uppercase">Pure Handloom</div>
              <p className="text-[10px] text-charcoal-500">Tested pure zari & silk</p>
            </div>
          </div>

        </div>

        {/* Right Column: Product Specs & Ordering */}
        <div className="lg:col-span-5 space-y-6">
          
          <div>
            {categoryName && (
              <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block mb-1">
                {categoryName}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal-950 font-normal leading-snug">
              {name}
            </h1>
            {sku && (
              <span className="text-[11px] text-charcoal-400 font-mono block mt-1">
                SKU: {sku}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-gold-200/60">
            {discountPrice ? (
              <>
                <span className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
                  {formatCurrency(discountPrice)}
                </span>
                <span className="text-sm text-charcoal-400 line-through">
                  {formatCurrency(price)}
                </span>
                <span className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-sm font-semibold">
                  Save {formatCurrency(price - discountPrice)}
                </span>
              </>
            ) : (
              <span className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
                {formatCurrency(price)}
              </span>
            )}
            <span className="text-[11px] text-charcoal-500 ml-auto">
              Inclusive of all taxes
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
            {description}
          </p>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-semibold text-charcoal-800">
                  Size / Fitting:
                </span>
                <Link to="/custom-stitching" className="text-gold-700 hover:underline flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Custom Measurements Guide</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-2 text-xs rounded-sm border transition-all ${
                      selectedSize === sz
                        ? 'bg-charcoal-900 text-gold-100 border-charcoal-900 font-semibold shadow-sm'
                        : 'bg-white border-gold-200 text-charcoal-700 hover:border-gold-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-800 block">
                Color Options: <span className="font-normal text-gold-800">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {colors.map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setSelectedColor(clr)}
                    className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                      selectedColor === clr
                        ? 'border-gold-700 bg-gold-50/80 font-semibold text-charcoal-900'
                        : 'border-gold-200 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {clr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customisation Note Input */}
          <div className="space-y-2 pt-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-gold-600" />
                <span>Custom Stitching & Measurement Notes (Optional)</span>
              </span>
              <span className="text-[10px] text-charcoal-400 font-normal">e.g. Blouse back design, padded cups, fall/pico</span>
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Provide specific bust/waist measurements, sleeve length, or embroidery requests..."
              className="w-full text-xs p-3 bg-white border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 transition"
            />
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${inStock && stock > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-charcoal-700">
              {inStock && stock > 0 ? `Ready in Atelier (${stock} available)` : 'Made to Order (Crafted upon request)'}
            </span>
          </div>

          {/* Quantity and Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-charcoal-300 rounded-sm bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-3 text-charcoal-600 hover:bg-gold-50 transition"
                >
                  -
                </button>
                <span className="px-4 text-xs font-semibold text-charcoal-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-3 text-charcoal-600 hover:bg-gold-50 transition"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-charcoal-900 hover:bg-charcoal-800 text-gold-100 py-3.5 px-6 rounded-sm text-xs uppercase tracking-widest font-semibold transition shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            {/* Instant Checkout / Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-gold-600 hover:bg-gold-700 text-charcoal-950 font-semibold py-3.5 px-6 rounded-sm text-xs uppercase tracking-widest transition shadow-sm"
            >
              Instant Buy / Checkout
            </button>

            {/* WhatsApp Direct Order Button */}
            <a
              href={`https://wa.me/${brandSettings?.socialLinks?.whatsappNumber || '919876543210'}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 border border-emerald-500/40 py-3 px-6 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Order via WhatsApp Direct</span>
            </a>
          </div>

          {/* Added notification toast banner */}
          {addedNotification && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-sm text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Item added to your shopping bag! View bag or proceed to checkout anytime.</span>
            </div>
          )}

          {/* Accordion Specifications */}
          <div className="border-t border-gold-200/60 pt-6 space-y-4 text-xs text-charcoal-700">
            {fabric && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-0.5">Fabric & Weave</h4>
                <p className="font-light">{fabric}</p>
              </div>
            )}
            {details && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-0.5">Artisanal Details & Borders</h4>
                <p className="font-light">{details}</p>
              </div>
            )}
            {customisation && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-0.5">Customisation Notes</h4>
                <p className="font-light">{customisation}</p>
              </div>
            )}
            {care && (
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-0.5">Care Instructions</h4>
                <p className="font-light">{care}</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-gold-200">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
            <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
              Complementary Silhouettes
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal">
              You May Also Adore
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
