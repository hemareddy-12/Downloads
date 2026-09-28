import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Upload, 
  X, 
  Check, 
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { uploadImage } from '../../services/settingsService';
import { formatCurrency } from '../../utils/formatters';

export const AdminProducts = () => {
  const { products, categories, refreshProducts } = useProducts();

  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initial Form tailored to Sarees, Half Sarees & Dresses
  const initialForm = {
    name: '',
    category: 'sarees',
    categoryName: 'Sarees',
    price: '',
    discountPrice: '',
    color: '',
    sizes: ['Free Size'],
    stock: 1,
    inStock: true,
    isNew: false,
    isFeatured: false,
    description: '',
    images: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [imageInputUrl, setImageInputUrl] = useState('');

  const openAddModal = (presetCategory = null) => {
    setEditingProduct(null);
    const catSlug = presetCategory || (activeCategoryTab !== 'all' ? activeCategoryTab : 'sarees');
    const catObj = categories.find(c => c.slug === catSlug);
    
    setFormData({
      ...initialForm,
      category: catSlug,
      categoryName: catObj ? catObj.name : (catSlug === 'sarees' ? 'Sarees' : catSlug === 'half-sarees' ? 'Half Sarees' : 'Dresses'),
      sizes: catSlug === 'dresses' ? ['S', 'M', 'L'] : ['Free Size'],
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      color: product.color || (Array.isArray(product.colors) ? product.colors.join(', ') : ''),
      sizes: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? [product.sizes] : []),
      images: product.images || [],
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setLoading(true);
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadImage(file, 'products');
        if (url) uploadedUrls.push(url);
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Image upload failed. You can also paste an image URL directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (imageInputUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInputUrl.trim()],
      }));
      setImageInputUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const current = prev.sizes || [];
      if (current.includes(size)) {
        return { ...prev, sizes: current.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...current, size] };
      }
    });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        await refreshProducts();
        setSuccess(`"${name}" was deleted successfully.`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete product.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.price) {
      setError('Please provide a product title and price.');
      return;
    }

    try {
      setLoading(true);

      const chosenCategory = categories.find(c => c.slug === formData.category || c.id === formData.category);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        categoryName: chosenCategory ? chosenCategory.name : (formData.category === 'sarees' ? 'Sarees' : formData.category === 'half-sarees' ? 'Half Sarees' : 'Dresses'),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock) || 1,
        inStock: Number(formData.stock) > 0,
        color: formData.color.trim(),
        colors: formData.color ? [formData.color.trim()] : [],
        sizes: formData.sizes && formData.sizes.length > 0 ? formData.sizes : ['Free Size'],
        isNew: Boolean(formData.isNew),
        isFeatured: Boolean(formData.isFeatured),
        description: formData.description.trim(),
        images: formData.images,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccess(`Updated "${payload.name}" successfully!`);
      } else {
        await createProduct(payload);
        setSuccess(`Added "${payload.name}" to ${payload.categoryName}!`);
      }

      await refreshProducts();
      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please check your entries.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category tab & search
  const filtered = products.filter(p => {
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.color?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategoryTab === 'all' || p.category === activeCategoryTab;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Inventory & Catalog Management
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Product Management ({products.length})
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Easily add, edit, and organize your Sarees, Half Sarees, and Dresses.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-5 py-3 rounded-sm transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Category Tabs: Sarees, Half Sarees, Dresses */}
      <div className="flex border-b border-charcoal-200 space-x-2 sm:space-x-4 text-xs uppercase tracking-wider font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveCategoryTab('all')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeCategoryTab === 'all'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategoryTab('sarees')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeCategoryTab === 'sarees'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Sarees ({products.filter(p => p.category === 'sarees').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategoryTab('half-sarees')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeCategoryTab === 'half-sarees'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Half Sarees ({products.filter(p => p.category === 'half-sarees').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategoryTab('dresses')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeCategoryTab === 'dresses'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Dresses ({products.filter(p => p.category === 'dresses').length})
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or colour..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gold-200 text-xs rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        {activeCategoryTab !== 'all' && (
          <button
            onClick={() => openAddModal(activeCategoryTab)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gold-800 hover:text-gold-950 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to {activeCategoryTab.replace('-', ' ')}</span>
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gold-200 rounded-sm shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-gold-100 text-charcoal-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal-400">
                    <ShoppingBag className="w-8 h-8 mx-auto text-charcoal-300 mb-2" />
                    <p className="font-medium text-charcoal-600">No products found in this category.</p>
                    <p className="text-[11px] text-charcoal-400 mt-1">
                      Click the "Add New Product" button above to upload photos and add your first design.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const image = product.images?.[0];

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="w-12 h-16 object-cover object-top rounded-sm border border-charcoal-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-charcoal-100 rounded-sm border flex items-center justify-center text-charcoal-400 text-[10px] text-center p-1">
                              No Photo
                            </div>
                          )}
                          <div>
                            <div className="font-serif font-medium text-sm text-charcoal-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-charcoal-400">
                              {product.images?.length || 0} {product.images?.length === 1 ? 'photo' : 'photos'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-charcoal-700 font-medium">
                        {product.categoryName || product.category}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal-950">
                          {formatCurrency(product.discountPrice || product.price)}
                        </div>
                        {product.discountPrice && (
                          <div className="text-[10px] text-charcoal-400 line-through">
                            {formatCurrency(product.price)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-charcoal-700">
                        {product.color || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.stock > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <span className="bg-gold-100 text-gold-900 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold">
                              Featured
                            </span>
                          )}
                          {product.isNew && (
                            <span className="bg-charcoal-900 text-gold-200 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold">
                              New Drop
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-charcoal-600 hover:text-gold-700 hover:bg-gold-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gold-300 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#FAF8F5] border-b border-gold-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-charcoal-950">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
                </h3>
                <span className="text-[11px] text-gold-800 font-semibold uppercase tracking-wider">
                  Category: {formData.categoryName}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm">
                  {error}
                </div>
              )}

              {/* Category Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Select Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catObj = categories.find(c => c.slug === cat);
                      setFormData({ 
                        ...formData, 
                        category: cat,
                        categoryName: catObj ? catObj.name : cat,
                      });
                    }}
                    className="w-full p-2.5 border border-gold-200 rounded-sm bg-white focus:outline-none focus:border-gold-500 font-medium"
                  >
                    <option value="sarees">Sarees</option>
                    <option value="half-sarees">Half Sarees</option>
                    <option value="dresses">Dresses</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Emerald Green Silk Saree"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Pricing, Discount, Colour, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="24000"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Optional Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="21000"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Colour *
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Royal Blue"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Available Sizes (Specifically required for Dresses) */}
              {formData.category === 'dresses' && (
                <div className="space-y-2 p-3 bg-[#FAF8F5] border border-gold-200 rounded-sm">
                  <label className="block uppercase font-semibold text-charcoal-700">
                    Available Sizes (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Fit'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeToggle(sz)}
                        className={`px-3 py-1.5 rounded-sm border font-semibold transition ${
                          formData.sizes?.includes(sz)
                            ? 'bg-charcoal-900 text-gold-100 border-charcoal-900'
                            : 'bg-white text-charcoal-600 border-gold-200 hover:border-gold-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured & New Arrival toggles */}
              <div className="flex flex-wrap items-center gap-6 p-3 bg-gold-50/50 rounded-sm border border-gold-200/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-gold-700"
                  />
                  <span className="font-semibold text-charcoal-800">Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-gold-700"
                  />
                  <span className="font-semibold text-charcoal-800">Mark as Featured Product</span>
                </label>
              </div>

              {/* Multiple Images Upload */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block uppercase font-semibold text-charcoal-700">
                    Product Photos (Multiple Photos Allowed)
                  </label>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                    🔒 Permanent Storage (Independent of Local Computer)
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-500 font-light">
                  Uploaded photos are stored permanently in cloud/server storage. Deleting the original photo from your computer will never break the image on the live website.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="cursor-pointer bg-charcoal-900 hover:bg-gold-700 text-gold-100 px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload Product Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2 w-full">
                    <input
                      type="url"
                      value={imageInputUrl}
                      onChange={(e) => setImageInputUrl(e.target.value)}
                      placeholder="Or paste an image web URL..."
                      className="w-full p-2 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-gold-100 hover:bg-gold-200 text-gold-900 px-3 py-2 rounded-sm font-semibold"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Uploaded Photos Preview */}
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-sm overflow-hidden border border-gold-300 group bg-charcoal-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"
                          title="Delete photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-charcoal-950/80 text-gold-200 text-[9px] uppercase text-center py-0.5 font-bold">
                            Main Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-gold-200 rounded-sm text-charcoal-400">
                    No photos added yet. Upload your own product photos using the button above.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the fabric, workmanship, drape, or details..."
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gold-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-charcoal-300 hover:bg-charcoal-50 rounded-sm uppercase tracking-wider font-semibold text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-2.5 rounded-sm uppercase tracking-wider font-semibold transition"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
