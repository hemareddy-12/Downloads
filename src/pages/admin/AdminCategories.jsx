import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Upload, FolderTree } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { createCategory, updateCategory, deleteCategory } from '../../services/productService';
import { uploadImage } from '../../services/settingsService';

export const AdminCategories = () => {
  const { categories, refreshCategories, products } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    featured: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
      featured: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || cat.id,
      description: cat.description || '',
      image: cat.image || '',
      featured: cat.featured ?? true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadImage(file, 'categories');
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
      }
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id);
        await refreshCategories();
        setSuccess(`Category "${name}" deleted.`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete category.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      setLoading(true);
      const payload = {
        ...formData,
        slug,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setSuccess(`Category "${payload.name}" updated!`);
      } else {
        await createCategory(payload);
        setSuccess(`Category "${payload.name}" created!`);
      }

      await refreshCategories();
      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Category Taxonomy
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Collections & Categories ({categories.length})
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Organize sarees, half sarees, dresses, and create custom seasonal categories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-5 py-3 rounded-sm transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter(p => p.category === cat.slug || p.category === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-white border border-gold-200 rounded-sm overflow-hidden shadow-card flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-charcoal-100 overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-charcoal-950/80 text-gold-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {count} pieces
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-charcoal-900 font-medium">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-gold-800 block mt-0.5">
                    slug: /{cat.slug || cat.id}
                  </span>
                  {cat.description && (
                    <p className="text-xs text-charcoal-500 font-light mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gold-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-charcoal-600 hover:text-gold-700 hover:bg-gold-50 rounded transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gold-300 w-full max-w-lg shadow-2xl p-6 space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-gold-200 pb-3">
              <h3 className="font-serif text-lg text-charcoal-950">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-charcoal-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Designer Lehengas"
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Category Slug (URL path)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. designer-lehengas"
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 lowercase font-mono"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for category showcase..."
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Banner Image URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                  <label className="cursor-pointer bg-gold-100 hover:bg-gold-200 text-gold-900 px-3 py-2 rounded-sm font-semibold shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gold-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-charcoal-300 rounded-sm uppercase tracking-wider text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-5 py-2 rounded-sm uppercase tracking-wider font-semibold transition"
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
