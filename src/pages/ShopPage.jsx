import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  Sparkles,
  PlusCircle 
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';
import { formatCurrency } from '../utils/formatters';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading } = useProducts();
  const { isAdmin } = useAuth();

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category param from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Dynamic max price bounds based on loaded products
  const highestPrice = useMemo(() => {
    if (!products.length) return 50000;
    return Math.max(...products.map(p => p.price || 0));
  }, [products]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesFabric = product.fabric?.toLowerCase().includes(query);
        const matchesCat = product.categoryName?.toLowerCase().includes(query);
        const matchesColor = product.color?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesFabric && !matchesCat && !matchesColor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'new-arrivals') {
          if (!product.isNew) return false;
        } else if (selectedCategory === 'featured') {
          if (!product.isFeatured) return false;
        } else if (product.category !== selectedCategory && product.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Price filter
      const effectivePrice = product.discountPrice || product.price;
      if (effectivePrice && effectivePrice > maxPrice) {
        return false;
      }

      // In stock
      if (onlyInStock && (!product.inStock || product.stock <= 0)) {
        return false;
      }

      // Sale items only
      if (onlySale && !product.discountPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-low') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      }
      if (selectedSort === 'price-high') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      }
      if (selectedSort === 'featured') {
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
      // default: newest
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, maxPrice, onlyInStock, onlySale, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxPrice(highestPrice || 100000);
    setOnlyInStock(false);
    setOnlySale(false);
    setSelectedSort('newest');
    setSearchParams({});
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), category: slug });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
          Curated Atelier Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-950 font-normal">
          {selectedCategory === 'sarees' 
            ? 'Sarees' 
            : selectedCategory === 'half-sarees' 
            ? 'Half Sarees' 
            : selectedCategory === 'dresses' 
            ? 'Dresses' 
            : 'All Creations'}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-light">
          Browse our hand-selected sarees, ceremonial half sarees, and bespoke dresses.
        </p>
      </div>

      {/* Top Controls: Search Bar & Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-gold-200/60 mb-8">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, fabric, colour..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gold-200 rounded-sm text-xs uppercase tracking-wider text-charcoal-800 font-medium"
          >
            <SlidersHorizontal className="w-4 h-4 text-gold-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-white border border-gold-200 text-charcoal-900 text-xs py-2.5 px-3 rounded-sm focus:outline-none focus:border-gold-500"
            >
              <option value="newest">Newest Drops</option>
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-8 bg-white/60 p-6 rounded-sm border border-gold-100 h-fit sticky top-28">
          
          <div className="flex items-center justify-between border-b border-gold-200/60 pb-3">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-600" />
              <span>Categories</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-gold-700 hover:text-gold-900 flex items-center gap-1 font-medium transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left py-1.5 px-2 rounded-sm transition ${
                  selectedCategory === 'all'
                    ? 'bg-charcoal-900 text-gold-100 font-medium'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-gold-50/60'
                }`}
              >
                All Products ({products.length})
              </button>
              
              {categories.map((cat) => {
                const count = products.filter(p => p.category === cat.slug || p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug || cat.id)}
                    className={`w-full text-left py-1.5 px-2 rounded-sm transition flex items-center justify-between ${
                      selectedCategory === (cat.slug || cat.id)
                        ? 'bg-charcoal-900 text-gold-100 font-medium'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-gold-50/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleCategorySelect('new-arrivals')}
                className={`w-full text-left py-1.5 px-2 rounded-sm transition flex items-center justify-between ${
                  selectedCategory === 'new-arrivals'
                    ? 'bg-charcoal-900 text-gold-100 font-medium'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-gold-50/60'
                }`}
              >
                <span>New Arrivals</span>
                <span className="text-[10px] opacity-70">({products.filter(p => p.isNew).length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('featured')}
                className={`w-full text-left py-1.5 px-2 rounded-sm transition flex items-center justify-between ${
                  selectedCategory === 'featured'
                    ? 'bg-charcoal-900 text-gold-100 font-medium'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-gold-50/60'
                }`}
              >
                <span>Featured Pieces</span>
                <span className="text-[10px] opacity-70">({products.filter(p => p.isFeatured).length})</span>
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          {products.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gold-200/50">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider font-semibold text-charcoal-800">Max Price</span>
                <span className="font-semibold text-gold-800">{formatCurrency(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={highestPrice || 100000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-gold-600"
              />
            </div>
          )}

          {/* Quick Toggles */}
          {products.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gold-200/50">
              <label className="flex items-center gap-2.5 text-xs text-charcoal-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-gold-300 text-gold-600 focus:ring-gold-500"
                />
                <span>In Stock Ready to Ship</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-charcoal-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="rounded border-gold-300 text-gold-600 focus:ring-gold-500"
                />
                <span>Special Offers</span>
              </label>
            </div>
          )}

        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          
          {/* Active Filter Bar */}
          <div className="flex items-center justify-between mb-6 text-xs text-charcoal-500">
            <div>
              Showing <span className="font-semibold text-charcoal-900">{filteredProducts.length}</span> pieces
              {selectedCategory !== 'all' && (
                <span className="ml-2 bg-gold-100 text-gold-900 px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] font-bold">
                  {selectedCategory.replace('-', ' ')}
                </span>
              )}
            </div>
            {(selectedCategory !== 'all' || searchQuery || onlyInStock || onlySale) && (
              <button
                onClick={handleResetFilters}
                className="text-gold-700 hover:text-gold-900 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Products List or Clean Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white/80 border border-gold-100 rounded-sm p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-charcoal-900">
                {products.length === 0 
                  ? 'No products added yet' 
                  : 'No designs match your filter criteria'}
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                {products.length === 0 
                  ? 'The catalog is ready for products to be added from the Admin Panel.'
                  : 'Try clearing your search terms or adjusting the category and price filters.'}
              </p>
              
              {isAdmin ? (
                <div className="pt-2">
                  <Link
                    to="/admin/products"
                    className="inline-flex items-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest px-6 py-2.5 rounded-sm font-semibold transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Products in Admin Panel</span>
                  </Link>
                </div>
              ) : (
                products.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest px-6 py-2.5 rounded-sm font-medium transition"
                  >
                    Reset Filters
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FAF8F5] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gold-200 pb-4">
                <h3 className="font-serif text-lg text-charcoal-900">Categories</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-charcoal-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { handleCategorySelect('all'); setIsMobileFilterOpen(false); }}
                    className="block w-full text-left py-1.5 px-2 rounded-sm"
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { handleCategorySelect(c.slug || c.id); setIsMobileFilterOpen(false); }}
                      className="block w-full text-left py-1.5 px-2 rounded-sm"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-gold-200">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-charcoal-950 text-gold-100 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
