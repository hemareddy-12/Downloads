import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export const NotFoundPage = () => {
  const { brandSettings } = useBrand();
  const brandName = brandSettings?.brandName || 'Label HemaReddy';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md space-y-6">
        <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>404 Haute Couture</span>
        </span>
        
        <h1 className="font-serif text-5xl sm:text-6xl text-charcoal-950 font-normal">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
          The silhouette or page you are seeking does not exist or has been curated into our archives.
        </p>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {brandName}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
