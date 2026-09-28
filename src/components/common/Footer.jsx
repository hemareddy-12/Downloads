import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Phone, 
  Mail, 
  MapPin, 
  Scissors, 
  Heart,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

export const Footer = () => {
  const { brandSettings, websiteSettings } = useBrand();
  const brandName = brandSettings?.brandName || 'hemareddy';
  const logoUrl = brandSettings?.logoUrl;
  const description = brandSettings?.description || '';
  const contact = websiteSettings?.contact || brandSettings?.socialLinks || {};
  const social = websiteSettings?.social || brandSettings?.socialLinks || {};
  const navConfig = websiteSettings?.navigation || {};

  return (
    <footer className="bg-charcoal-950 text-charcoal-200 border-t border-charcoal-800 pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-charcoal-800">
          
          {/* Brand Info & Logo Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-14 md:h-16 w-auto object-contain brightness-110"
                />
              ) : (
                <div className="flex flex-col">
                  <span className="font-serif text-3xl tracking-widest text-gold-200 font-normal">
                    {brandName}
                  </span>
                  {brandSettings?.tagline ? (
                    <span className="text-[11px] tracking-widest text-gold-500 mt-1">
                      {brandSettings.tagline}
                    </span>
                  ) : null}
                </div>
              )}
            </Link>

            {description ? (
              <p className="text-sm text-charcoal-300 leading-relaxed font-light max-w-md">
                {description}
              </p>
            ) : (
              <p className="text-sm text-charcoal-300 leading-relaxed font-light max-w-md">
                {navConfig.footerText || `Bespoke Haute Couture Atelier & Stitching by ${brandName}.`}
              </p>
            )}

            {/* Direct WhatsApp Callout */}
            {contact.whatsappNumber && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${contact.whatsappNumber}?text=Hello%20${encodeURIComponent(brandName)},%20I%20would%20like%20to%20enquire%20about%20your%20designs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-gold-600/20 hover:bg-gold-600/30 text-gold-300 border border-gold-500/40 px-4 py-2 rounded-full text-xs tracking-wider transition-all duration-200 group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp Atelier: {contact.whatsapp || contact.whatsappNumber}</span>
                </a>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex items-center space-x-4 pt-2">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-700 flex items-center justify-center text-charcoal-300 hover:text-gold-300 hover:border-gold-500 transition"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-700 flex items-center justify-center text-charcoal-300 hover:text-gold-300 hover:border-gold-500 transition"
                  aria-label="Phone"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-700 flex items-center justify-center text-charcoal-300 hover:text-gold-300 hover:border-gold-500 transition"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider">
              <li>
                <Link to="/shop?category=sarees" className="hover:text-gold-400 transition">
                  Sarees
                </Link>
              </li>
              <li>
                <Link to="/shop?category=half-sarees" className="hover:text-gold-400 transition">
                  Half Sarees
                </Link>
              </li>
              <li>
                <Link to="/shop?category=dresses" className="hover:text-gold-400 transition">
                  Dresses
                </Link>
              </li>
              <li>
                <Link to="/creations" className="hover:text-gold-400 transition flex items-center gap-1.5 text-gold-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  My Creations
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold-400 transition">
                  Browse All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Stitching Service */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Stitching Services
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider">
              <li>
                <Link to="/stitching" className="hover:text-gold-400 transition flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-gold-400" />
                  Stitching Overview
                </Link>
              </li>
              <li>
                <Link to="/stitching" className="hover:text-gold-400 transition">
                  Custom Blouses & Maggam Work
                </Link>
              </li>
              <li>
                <Link to="/stitching" className="hover:text-gold-400 transition">
                  Half Saree & Lehenga Tailoring
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-gold-400 transition">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Studio & Contact
            </h4>
            <div className="space-y-3 text-xs text-charcoal-300 font-light">
              {contact.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-gold-300 transition">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-gold-300 transition">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.businessHours && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span>{contact.businessHours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <p>
            © {new Date().getFullYear()} <span className="text-gold-300 font-medium">{brandName}</span>. {navConfig.footerCopyright || 'All rights reserved.'}
          </p>
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-wider">
            <Link to="/about" className="hover:text-gold-400 transition">About</Link>
            <Link to="/contact" className="hover:text-gold-400 transition">Contact</Link>
            <Link to="/admin/login" className="hover:text-gold-400 transition text-charcoal-500">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
