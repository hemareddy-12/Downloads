import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Scissors, 
  ShieldCheck, 
  Truck, 
  Ruler, 
  Instagram, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';

export const HomePage = () => {
  const { brandSettings, websiteSettings } = useBrand();
  const { products, categories } = useProducts();
  const { isAdmin } = useAuth();
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const brandName = brandSettings?.brandName || 'hemareddy';
  const tagline = brandSettings?.tagline || '';
  const logoUrl = brandSettings?.logoUrl;
  const profilePhoto = brandSettings?.profilePhotoUrl;
  const description = brandSettings?.description || '';

  const hp = websiteSettings?.homepage || {};
  const social = websiteSettings?.social || brandSettings?.socialLinks || {};

  // Featured and New Arrival filters
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  // Tab filtered products
  const tabProducts = activeCategoryTab === 'all'
    ? products.slice(0, 8)
    : products.filter(p => p.category === activeCategoryTab).slice(0, 8);

  return (
    <div className="relative overflow-hidden space-y-24 md:space-y-32 pb-20">
      
      {/* 1. HERO SECTION */}
      <section 
        className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 border-b border-gold-200/50 bg-gradient-to-b from-[#F7F2EC] via-[#FAF8F5] to-[#FAF8F5]"
        style={hp.heroImageUrl ? {
          backgroundImage: `linear-gradient(rgba(247, 242, 236, 0.85), rgba(250, 248, 245, 0.95)), url(${hp.heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className="absolute inset-4 md:inset-8 border border-gold-300/30 pointer-events-none rounded-sm"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center py-16 md:py-24 space-y-6">
          
          {/* Logo or Brand Heading */}
          <div className="inline-flex items-center justify-center mb-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={brandName} 
                className="h-20 md:h-28 w-auto object-contain drop-shadow-sm mx-auto"
              />
            ) : (
              <span className="font-serif text-4xl sm:text-6xl text-charcoal-950 font-light tracking-widest uppercase block">
                {brandName}
              </span>
            )}
          </div>

          {tagline ? (
            <div className="text-xs uppercase tracking-widest text-gold-700 font-medium">
              {tagline}
            </div>
          ) : null}

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-charcoal-950 tracking-tight leading-tight">
            {hp.heroHeading || 'Handcrafted Couture & Bespoke Stitching'}
          </h1>

          {hp.heroSubtitle ? (
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
              {hp.heroSubtitle}
            </p>
          ) : null}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={hp.heroButtonLink || "/shop"}
              className="w-full sm:w-auto bg-charcoal-950 hover:bg-gold-800 text-gold-100 px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-luxury flex items-center justify-center gap-2 group"
            >
              <span>{hp.heroButtonText || 'Explore Collections'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/creations"
              className="w-full sm:w-auto bg-white/90 hover:bg-gold-50 text-charcoal-900 border border-gold-300 px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>My Creations</span>
            </Link>

            <Link
              to={hp.heroSecondaryButtonLink || "/stitching"}
              className="w-full sm:w-auto bg-white/90 hover:bg-gold-50 text-charcoal-900 border border-gold-300 px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Scissors className="w-4 h-4 text-gold-600" />
              <span>{hp.heroSecondaryButtonText || 'Stitching Services'}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY SHOWCASE (Sarees, Half Sarees, Dresses) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
            Signature Categorizations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
            {hp.categorySectionTitle || 'Curated Categories'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const customDesc = hp.categoryDescriptions?.[cat.slug] || cat.description;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug || cat.id}`}
                className="group relative aspect-[3/4] rounded-sm overflow-hidden bg-charcoal-900 shadow-card hover:shadow-luxury transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-gold-300 font-semibold block">
                    Collection
                  </span>
                  <h3 className="font-serif text-2xl font-light text-white group-hover:text-gold-200 transition-colors">
                    {cat.name}
                  </h3>
                  {customDesc && (
                    <p className="text-xs text-charcoal-300 font-light line-clamp-2">
                      {customDesc}
                    </p>
                  )}
                  <div className="pt-2 flex items-center text-xs text-gold-300 font-medium tracking-wider uppercase gap-1 group-hover:gap-2 transition-all">
                    <span>View {cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCT CATALOG SHOWCASE (DYNAMIC - NO HARDCODED DEMO PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-gold-200/70 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
              Atelier Catalogue
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
              {hp.featuredSectionTitle || 'Featured Designs'}
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategoryTab('all')}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                activeCategoryTab === 'all'
                  ? 'bg-charcoal-900 text-gold-200 font-semibold shadow-sm'
                  : 'bg-white/80 text-charcoal-600 hover:text-charcoal-950 border border-gold-200/60'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('sarees')}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                activeCategoryTab === 'sarees'
                  ? 'bg-charcoal-900 text-gold-200 font-semibold shadow-sm'
                  : 'bg-white/80 text-charcoal-600 hover:text-charcoal-950 border border-gold-200/60'
              }`}
            >
              Sarees
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('half-sarees')}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                activeCategoryTab === 'half-sarees'
                  ? 'bg-charcoal-900 text-gold-200 font-semibold shadow-sm'
                  : 'bg-white/80 text-charcoal-600 hover:text-charcoal-950 border border-gold-200/60'
              }`}
            >
              Half Sarees
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('dresses')}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                activeCategoryTab === 'dresses'
                  ? 'bg-charcoal-900 text-gold-200 font-semibold shadow-sm'
                  : 'bg-white/80 text-charcoal-600 hover:text-charcoal-950 border border-gold-200/60'
              }`}
            >
              Dresses
            </button>
          </div>
        </div>

        {/* Dynamic Products Grid or Clean Empty State */}
        {tabProducts.length === 0 ? (
          <div className="bg-white/80 border border-gold-200/70 rounded-sm p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900">
              {activeCategoryTab === 'all' ? 'New Designs Arriving Soon' : `No ${activeCategoryTab.replace('-', ' ')} added yet`}
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed font-light">
              Our latest hand-curated pieces will be added here shortly. In the meantime, explore our custom stitching services.
            </p>
            {isAdmin && (
              <div className="pt-2">
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-5 py-2.5 rounded-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Products in Admin Panel</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tabProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border-b-2 border-charcoal-900 hover:border-gold-700 text-charcoal-900 hover:text-gold-700 pb-1 text-xs uppercase tracking-widest font-semibold transition-all"
            >
              <span>View Complete Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. DEDICATED STITCHING SERVICE SECTION */}
      <section className="bg-charcoal-950 text-white relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden border border-gold-500/30 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop"
                  alt="Custom Stitching Service"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-charcoal-900/90 backdrop-blur-md border border-gold-500/40 rounded-sm">
                  <div className="flex items-center gap-3">
                    <Scissors className="w-6 h-6 text-gold-400 shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm text-gold-100">Bespoke Stitching Service</h4>
                      <p className="text-[11px] text-charcoal-300">Custom blouse, half saree & gown tailoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400 block">
                Atelier Needlecraft
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                Precision Stitching & Custom Tailoring
              </h2>
              
              <p className="text-sm text-charcoal-300 font-light leading-relaxed">
                As part of the <strong className="text-white font-normal">{brandName}</strong> clothing label, we provide personal custom stitching services. From bridal blouses with intricate Aari/Maggam handwork to tailored festive Half Sarees and designer gowns, every piece is sculpted to your exact measurements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-charcoal-900/60 border border-charcoal-800 rounded-sm space-y-1">
                  <span className="text-gold-400 font-serif text-sm font-semibold">Custom Blouse Tailoring</span>
                  <p className="text-xs text-charcoal-400">Padded cups, custom necklines, piping, and hand latkans.</p>
                </div>
                <div className="p-4 bg-charcoal-900/60 border border-charcoal-800 rounded-sm space-y-1">
                  <span className="text-gold-400 font-serif text-sm font-semibold">Maggam & Aari Needlework</span>
                  <p className="text-xs text-charcoal-400">Hand zardozi, kundan, and pearl embroidery crafted to match your sarees.</p>
                </div>
                <div className="p-4 bg-charcoal-900/60 border border-charcoal-800 rounded-sm space-y-1">
                  <span className="text-gold-400 font-serif text-sm font-semibold">Half Saree / Lehenga Crafting</span>
                  <p className="text-xs text-charcoal-400">Custom pleated waistbands, double can-can flare, and voni drape.</p>
                </div>
                <div className="p-4 bg-charcoal-900/60 border border-charcoal-800 rounded-sm space-y-1">
                  <span className="text-gold-400 font-serif text-sm font-semibold">Doorstep Fitting Support</span>
                  <p className="text-xs text-charcoal-400">Generous inner seam margins for effortless future adjustments.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/stitching"
                  className="bg-gold-600 hover:bg-gold-500 text-charcoal-950 font-semibold px-8 py-3.5 rounded-sm text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>View Stitching Services & Portfolio</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. ABOUT THE BRAND (Dynamic from Brand Settings) */}
      {(description || profilePhoto) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF6F0] border border-gold-200/80 rounded-sm p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {profilePhoto && (
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[3/4] rounded-sm overflow-hidden shadow-luxury border-4 border-white">
                    <img
                      src={profilePhoto}
                      alt={brandName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              )}

              <div className={profilePhoto ? "lg:col-span-7 space-y-5" : "lg:col-span-12 space-y-5 text-center max-w-2xl mx-auto"}>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
                  The Brand
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
                  About {brandName}
                </h2>

                {description && (
                  <p className="text-sm text-charcoal-700 font-light leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-gold-700 text-gold-100 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-medium transition-colors"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* 6. INSTAGRAM / SOCIAL MEDIA */}
      {social.instagram && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block flex items-center justify-center gap-1.5">
              <Instagram className="w-4 h-4" />
              <span>Studio & Work Showcase</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
              Follow {social.instagramHandle || brandName}
            </h2>
          </div>

          <div className="text-center">
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gold-400 bg-white hover:bg-gold-50 text-charcoal-900 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Visit Instagram Page</span>
            </a>
          </div>
        </section>
      )}

    </div>
  );
};
