import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Scissors, 
  Crown, 
  Award, 
  Feather,
  Quote,
  User,
  MessageCircle
} from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export const AboutPage = () => {
  const { brandSettings, aboutSettings } = useBrand();
  const brandName = brandSettings?.brandName || 'hemareddy';
  const logoUrl = brandSettings?.logoUrl;
  const social = brandSettings?.socialLinks || {};

  const heading = aboutSettings?.heading || 'About Me';
  const subheading = aboutSettings?.subheading || 'Where Heritage Weaves Meet Precision Haute Couture';
  const photoUrl = aboutSettings?.photoUrl;
  const quotation = aboutSettings?.quotation;
  const introduction = aboutSettings?.introduction;
  const story = aboutSettings?.story;
  const passion = aboutSettings?.passion;
  const promise = aboutSettings?.promise;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-20">
      
      {/* 1. Brand Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center justify-center">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-16 md:h-20 w-auto object-contain mx-auto mb-2" />
          ) : (
            <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold bg-gold-100/70 px-4 py-1.5 rounded-full border border-gold-300/50">
              The Heritage of South Asian Couture
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-charcoal-950 font-normal leading-tight">
          {heading}
        </h1>

        {subheading && (
          <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
      </section>

      {/* 2. Meet the Designer Showcase */}
      <section className="bg-[#FAF6F0] border border-gold-200/90 rounded-sm p-8 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Photo Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-sm overflow-hidden shadow-2xl border-4 border-white bg-charcoal-900 flex items-center justify-center">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={brandName}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <span className="font-serif text-2xl font-normal text-gold-200 block">
                      {brandName}
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-charcoal-200">
                      Founder & Master Couturier
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-3 text-gold-200">
                  <div className="w-20 h-20 rounded-full border border-gold-500/50 flex items-center justify-center mx-auto text-gold-400">
                    <User className="w-10 h-10" />
                  </div>
                  <span className="font-serif text-2xl tracking-wider block capitalize">
                    {brandName}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-gold-400 block font-light">
                    Atelier Haute Couture
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio & Quotation Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <span className="text-xs font-semibold uppercase tracking-widest-luxury text-gold-700 block">
              Atelier Couturier
            </span>
            
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
              {heading}
            </h2>

            {/* Editable Quotation (rendered only if set) */}
            {quotation && (
              <blockquote className="font-serif text-lg sm:text-xl italic text-gold-900 border-l-2 border-gold-600 pl-4 py-2 leading-relaxed bg-white/60 rounded-r-sm p-4">
                "{quotation}"
              </blockquote>
            )}

            {/* Editable Introduction */}
            {introduction && (
              <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-normal">
                {introduction}
              </p>
            )}

            {/* Additional details */}
            <div className="space-y-4 text-xs sm:text-sm text-charcoal-700 font-light leading-relaxed pt-2">
              {passion && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-1">
                    Passion for Fashion & Stitching
                  </h4>
                  <p>{passion}</p>
                </div>
              )}

              {story && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-1">
                    The Story Behind the Needle
                  </h4>
                  <p>{story}</p>
                </div>
              )}

              {promise && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-charcoal-900 mb-1">
                    The {brandName} Promise
                  </h4>
                  <p>{promise}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20${encodeURIComponent(brandName)},%20I%20would%20love%20to%20consult%20regarding%20a%20bespoke%20design.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-charcoal-950 hover:bg-[#25D366] hover:text-white text-gold-100 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consult on WhatsApp</span>
              </a>

              <Link
                to="/creations"
                className="border border-gold-500 hover:bg-gold-50 text-charcoal-900 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-medium transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>View My Creations</span>
              </Link>

              <Link
                to="/stitching"
                className="border border-gold-300 hover:bg-gold-50 text-charcoal-900 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-medium transition"
              >
                Stitching Services
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Atelier Quality Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="p-6 bg-white border border-gold-200/70 rounded-sm shadow-sm space-y-2">
          <Crown className="w-6 h-6 text-gold-600 mx-auto" />
          <h4 className="font-serif text-base text-charcoal-900">Bespoke Fit</h4>
          <p className="text-xs text-charcoal-500 font-light">Custom tailored to your exact bust, waist, and height specifications.</p>
        </div>

        <div className="p-6 bg-white border border-gold-200/70 rounded-sm shadow-sm space-y-2">
          <Feather className="w-6 h-6 text-gold-600 mx-auto" />
          <h4 className="font-serif text-base text-charcoal-900">Pure Fabrics</h4>
          <p className="text-xs text-charcoal-500 font-light">Mulberry silks, soft organzas, and natural cotton weaves.</p>
        </div>

        <div className="p-6 bg-white border border-gold-200/70 rounded-sm shadow-sm space-y-2">
          <Scissors className="w-6 h-6 text-gold-600 mx-auto" />
          <h4 className="font-serif text-base text-charcoal-900">Artisan Needlework</h4>
          <p className="text-xs text-charcoal-500 font-light">Maggam, Aari, zardozi wire, kundan, and moti craftsmanship.</p>
        </div>

        <div className="p-6 bg-white border border-gold-200/70 rounded-sm shadow-sm space-y-2">
          <Award className="w-6 h-6 text-gold-600 mx-auto" />
          <h4 className="font-serif text-base text-charcoal-900">Personal Care</h4>
          <p className="text-xs text-charcoal-500 font-light">Direct couture consultation and post-delivery sizing guarantee.</p>
        </div>
      </section>

    </div>
  );
};
