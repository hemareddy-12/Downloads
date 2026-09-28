import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  Scissors, 
  ShieldCheck, 
  Search,
  Sparkles 
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { brandSettings, websiteSettings } = useBrand();
  const { cartCount, setIsDrawerOpen, wishlist } = useCart();
  const { isAdmin } = useAuth();

  const brandName = brandSettings?.brandName || 'hemareddy';
  const tagline = brandSettings?.tagline || '';
  const logoUrl = brandSettings?.logoUrl;

  const navConfig = websiteSettings?.navigation || {};
  const menuNames = navConfig.menuNames || {};
  const visible = navConfig.visibleItems || {};

  const allNavLinks = [
    { key: 'home', label: menuNames.home || 'Home', path: '/' },
    { key: 'shop', label: menuNames.shop || 'Shop All', path: '/shop' },
    { key: 'sarees', label: menuNames.sarees || 'Sarees', path: '/shop?category=sarees' },
    { key: 'halfSarees', label: menuNames.halfSarees || 'Half Sarees', path: '/shop?category=half-sarees' },
    { key: 'dresses', label: menuNames.dresses || 'Dresses', path: '/shop?category=dresses' },
    { 
      key: 'creations', 
      label: menuNames.creations || 'My Creations', 
      path: '/creations',
      highlight: true,
      icon: Sparkles
    },
    { 
      key: 'stitching',
      label: menuNames.stitching || 'Stitching', 
      path: '/stitching',
      icon: Scissors 
    },
    { key: 'about', label: menuNames.about || 'About', path: '/about' },
    { key: 'contact', label: menuNames.contact || 'Contact', path: '/contact' },
  ];

  // Filter links based on admin show/hide settings (defaults to true if undefined)
  const navLinks = allNavLinks.filter(item => visible[item.key] !== false);

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-gold-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-charcoal-800 hover:text-gold-700 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo & Name Area */}
            <div className="flex items-center flex-1 lg:flex-none justify-center lg:justify-start">
              <Link to="/" className="flex items-center gap-3.5 group">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={brandName}
                    className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 py-1"
                  />
                ) : (
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-serif text-2xl md:text-3xl tracking-widest text-charcoal-900 font-medium group-hover:text-gold-700 transition-colors">
                      {brandName}
                    </span>
                    {tagline ? (
                      <span className="text-[10px] tracking-widest text-gold-700 mt-0.5 font-sans font-medium">
                        {tagline}
                      </span>
                    ) : null}
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-xs uppercase tracking-widest transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                      link.highlight
                        ? 'text-gold-800 font-semibold border-gold-500/60 bg-gold-50/70 px-2.5 py-1 rounded-sm'
                        : active
                        ? 'text-charcoal-950 font-semibold border-gold-600'
                        : 'text-charcoal-700 hover:text-gold-700 border-transparent hover:border-gold-300'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-gold-600" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons: Search, Wishlist, Bag, Admin */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <Link
                to="/shop"
                className="p-2 text-charcoal-700 hover:text-gold-700 transition"
                title="Search Collection"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/shop"
                className="p-2 text-charcoal-700 hover:text-gold-700 transition relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-charcoal-800 hover:text-gold-700 transition relative group"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 text-charcoal-800 group-hover:text-gold-700 transition" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gold-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Admin Portal Shortcut */}
              <Link
                to={isAdmin ? "/admin" : "/admin/login"}
                className={`p-2 transition rounded-full flex items-center gap-1.5 ${
                  isAdmin 
                    ? 'bg-gold-100 text-gold-900 border border-gold-300 px-3' 
                    : 'text-charcoal-400 hover:text-gold-700'
                }`}
                title={isAdmin ? "Owner Admin Portal" : "Admin Login"}
              >
                <ShieldCheck className="w-5 h-5" />
                {isAdmin && <span className="text-xs font-semibold hidden md:inline">Admin</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-b border-gold-200 px-6 py-6 space-y-4 animate-fade-in shadow-xl">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 text-sm uppercase tracking-widest transition-colors flex items-center justify-between ${
                    link.highlight
                      ? 'text-gold-800 font-bold bg-gold-100/70 px-3 rounded'
                      : active
                      ? 'text-gold-700 font-semibold pl-2 border-l-2 border-gold-600'
                      : 'text-charcoal-800 hover:text-gold-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-gold-600" />}
                    {link.label}
                  </span>
                  <span className="text-gold-400">→</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gold-200/60 flex items-center justify-between">
              <Link
                to={isAdmin ? "/admin" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-widest text-gold-800 flex items-center gap-2 font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
              </Link>
              <Link
                to="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-widest text-charcoal-600 hover:text-gold-700"
              >
                Track Order
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
