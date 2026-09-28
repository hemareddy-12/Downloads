import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FolderTree, 
  Scissors, 
  Mail, 
  Sliders, 
  User, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Palette,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';

export const AdminLayout = () => {
  const { isAdmin, logout, loading } = useAuth();
  const { brandSettings } = useBrand();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Protected route check
  React.useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center text-gold-300 text-xs tracking-wider">
        Verifying administrator authorization...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const brandName = brandSettings?.brandName || 'hemareddy';
  const logoUrl = brandSettings?.logoUrl;

  const menuItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products (For Sale)', path: '/admin/products', icon: ShoppingBag },
    { label: 'My Creations (Portfolio)', path: '/admin/creations', icon: Sparkles },
    { label: 'Stitching (Services & Work)', path: '/admin/stitching', icon: Scissors },
    { label: 'About (Me & Story)', path: '/admin/about', icon: User },
    { label: 'Contact (Details & Social)', path: '/admin/contact', icon: Phone },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: Package },
    { label: 'Custom Stitching Enquiries', path: '/admin/enquiries', icon: Scissors },
    { label: 'Customer Messages', path: '/admin/messages', icon: Mail },
    { label: 'Website Settings & Colors', path: '/admin/website-settings', icon: Palette },
    { label: 'Brand & Watermark', path: '/admin/brand-settings', icon: Sliders },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] flex flex-col lg:flex-row text-charcoal-900">
      
      {/* Mobile Admin Header */}
      <div className="lg:hidden bg-charcoal-950 text-gold-100 p-4 flex items-center justify-between border-b border-charcoal-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gold-400" />
          <span className="font-serif text-base font-semibold">{brandName} Studio Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1 text-gold-200"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-charcoal-950 text-charcoal-200 border-r border-charcoal-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo in Admin */}
          <div className="p-6 border-b border-charcoal-800 flex flex-col items-center text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-12 w-auto object-contain brightness-110 mb-2"
              />
            ) : (
              <div className="font-serif text-xl font-semibold text-gold-200 tracking-wider">
                {brandName}
              </div>
            )}
            <div className="text-[10px] uppercase tracking-widest text-gold-500 font-semibold">
              Owner Management Portal
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-sm text-xs uppercase tracking-wider font-medium transition-all ${
                    active
                      ? 'bg-gold-600 text-charcoal-950 font-bold shadow-sm'
                      : 'text-charcoal-300 hover:text-gold-200 hover:bg-charcoal-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Storefront & Logout */}
        <div className="p-4 border-t border-charcoal-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-wider text-charcoal-300 hover:text-gold-200 hover:bg-charcoal-900 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gold-500" />
              <span>View Storefront</span>
            </span>
            <span className="text-[10px] bg-charcoal-800 text-gold-400 px-1.5 py-0.5 rounded">Live</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

    </div>
  );
};
