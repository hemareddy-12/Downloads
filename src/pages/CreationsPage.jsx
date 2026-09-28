import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Images, 
  Eye, 
  MessageCircle, 
  Scissors, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { getCreations } from '../services/creationService';
import { useBrand } from '../context/BrandContext';
import { Link } from 'react-router-dom';

export const CreationsPage = () => {
  const { brandSettings } = useBrand();
  const brandName = brandSettings?.brandName || 'hemareddy';
  const social = brandSettings?.socialLinks || {};

  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Lightbox / Detail Modal state
  const [activeCreation, setActiveCreation] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const data = await getCreations();
        setCreations(data || []);
      } catch (err) {
        console.error('Error fetching creations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreations();
  }, []);

  // Compute unique categories
  const categories = ['All', ...new Set(creations.map(c => c.category).filter(Boolean))];

  // Filter creations
  const filteredCreations = selectedCategory === 'All'
    ? creations
    : creations.filter(c => c.category === selectedCategory);

  const openLightbox = (creation, imageIndex = 0) => {
    setActiveCreation(creation);
    setActiveImageIndex(imageIndex);
  };

  const closeLightbox = () => {
    setActiveCreation(null);
    setActiveImageIndex(0);
  };

  const nextImage = () => {
    if (!activeCreation || !activeCreation.images) return;
    setActiveImageIndex((prev) => (prev + 1) % activeCreation.images.length);
  };

  const prevImage = () => {
    if (!activeCreation || !activeCreation.images) return;
    setActiveImageIndex((prev) => (prev - 1 + activeCreation.images.length) % activeCreation.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Haute Couture Portfolio</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-charcoal-950 font-normal leading-tight">
          My Creations & Bespoke Designs
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
          A personal lookbook celebrating custom-tailored silhouettes, intricate embroidery, and one-of-a-kind outfits created by <strong className="font-medium text-charcoal-900">{brandName}</strong>. These pieces represent our creative artistry and bespoke craftsmanship.
        </p>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal-950 text-gold-100 shadow-md scale-105'
                  : 'bg-white border border-gold-200 text-charcoal-700 hover:border-gold-400 hover:bg-gold-50/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Creations Gallery Grid */}
      {loading ? (
        <div className="text-center py-20 text-charcoal-400 text-xs">
          Loading portfolio designs...
        </div>
      ) : filteredCreations.length === 0 ? (
        <div className="bg-white border border-gold-200/80 rounded-sm p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <Scissors className="w-10 h-10 text-gold-500 mx-auto opacity-70" />
          <h3 className="font-serif text-2xl text-charcoal-900">
            {selectedCategory === 'All' ? 'Portfolio Coming Soon' : `No creations found in "${selectedCategory}"`}
          </h3>
          <p className="text-xs text-charcoal-600 font-light leading-relaxed">
            New bespoke outfits, designer blouses, and ceremonial ensembles are being curated for this lookbook.
          </p>
          <div className="pt-2">
            <Link
              to="/stitching"
              className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition"
            >
              <Scissors className="w-3.5 h-3.5 text-gold-400" />
              <span>Explore Custom Stitching</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCreations.map((item) => {
            const displayImages = item.images && item.images.length > 0 
              ? item.images 
              : item.primaryImage 
                ? [item.primaryImage] 
                : [];
            const primaryImg = displayImages[0];

            return (
              <div
                key={item.id}
                className="group bg-white rounded-sm border border-gold-200/80 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image Container */}
                  <div 
                    onClick={() => displayImages.length > 0 && openLightbox(item, 0)}
                    className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal-100 cursor-pointer"
                  >
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-charcoal-300 bg-gold-50/40 p-4">
                        <Scissors className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-[11px] uppercase tracking-wider text-charcoal-400">Creation Photo</span>
                      </div>
                    )}

                    {/* Gradient Overlay & Zoom Icon */}
                    <div className="absolute inset-0 bg-charcoal-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-3 bg-white/90 text-charcoal-950 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                        <Eye className="w-5 h-5 text-gold-700" />
                      </span>
                    </div>

                    {/* Multi-image badge */}
                    {displayImages.length > 1 && (
                      <div className="absolute top-3 right-3 bg-charcoal-950/70 backdrop-blur-sm text-gold-200 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Images className="w-3 h-3 text-gold-400" />
                        <span>{displayImages.length} Photos</span>
                      </div>
                    )}

                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute bottom-3 left-3 bg-white/95 text-charcoal-900 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-sm shadow-sm border border-gold-200">
                        {item.category}
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="p-6 space-y-2.5">
                    <h3 className="font-serif text-xl text-charcoal-950 font-normal leading-snug group-hover:text-gold-800 transition-colors">
                      {item.title}
                    </h3>

                    {item.caption && (
                      <p className="text-[11px] uppercase tracking-wider text-gold-700 font-semibold">
                        {item.caption}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-charcoal-600 font-light leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action: Enquire about similar bespoke outfit */}
                <div className="p-4 bg-[#FAF8F5] border-t border-gold-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20${encodeURIComponent(brandName)},%20I%20saw%20your%20creation%20"${encodeURIComponent(item.title)}"%20in%20your%20portfolio%20and%20would%20love%20to%20consult%20about%20a%20similar%20design.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-[#25D366] hover:text-white text-gold-100 text-[11px] uppercase tracking-wider font-semibold py-2.5 px-3 rounded-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enquire On WhatsApp</span>
                  </a>

                  {displayImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => openLightbox(item, 0)}
                      className="p-2.5 border border-gold-300 hover:bg-gold-50 text-charcoal-700 rounded-sm transition"
                      title="View all photos"
                    >
                      <Images className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / High-Res Carousel Modal */}
      {activeCreation && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 p-2 bg-charcoal-950/60 hover:bg-charcoal-950 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview Column */}
            <div className="relative md:w-3/5 bg-charcoal-950 flex items-center justify-center min-h-[350px] md:min-h-[550px] overflow-hidden">
              {activeCreation.images && activeCreation.images.length > 0 ? (
                <img
                  src={activeCreation.images[activeImageIndex] || activeCreation.images[0]}
                  alt={activeCreation.title}
                  className="max-h-[85vh] w-auto object-contain mx-auto transition-all duration-300"
                />
              ) : (
                <div className="text-charcoal-500 text-xs">No image available</div>
              )}

              {/* Prev / Next controls if multiple photos */}
              {activeCreation.images && activeCreation.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-charcoal-900/70 hover:bg-charcoal-900 text-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-charcoal-900/70 hover:bg-charcoal-900 text-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                    {activeCreation.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeImageIndex === idx ? 'bg-gold-400 w-5' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details Column */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6 bg-white">
              <div className="space-y-4">
                {activeCreation.category && (
                  <span className="text-[10px] uppercase tracking-widest-luxury text-gold-700 font-semibold bg-gold-50 border border-gold-200 px-3 py-1 rounded-full inline-block">
                    {activeCreation.category}
                  </span>
                )}

                <h2 className="font-serif text-2xl md:text-3xl text-charcoal-950 font-normal leading-snug">
                  {activeCreation.title}
                </h2>

                {activeCreation.caption && (
                  <p className="text-xs font-serif italic text-gold-800">
                    "{activeCreation.caption}"
                  </p>
                )}

                {activeCreation.description && (
                  <div className="text-xs text-charcoal-600 font-light leading-relaxed space-y-2 pt-2 border-t border-gold-100">
                    <p>{activeCreation.description}</p>
                  </div>
                )}
              </div>

              {/* Consultation / Bespoke Request Button */}
              <div className="space-y-3 pt-6 border-t border-gold-100">
                <a
                  href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20${encodeURIComponent(brandName)},%20I%20am%20interested%20in%20consulting%20for%20a%20custom%20piece%20similar%20to%20"${encodeURIComponent(activeCreation.title)}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-emerald-600 text-white py-3 px-4 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss Similar Design</span>
                </a>

                <Link
                  to="/stitching"
                  onClick={closeLightbox}
                  className="w-full bg-charcoal-950 hover:bg-gold-700 text-gold-100 py-3 px-4 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Scissors className="w-4 h-4 text-gold-400" />
                  <span>Book Custom Stitching</span>
                </Link>

                <p className="text-[10px] text-center text-charcoal-400 font-light">
                  Portfolio Showcase • Made-to-measure by {brandName}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
