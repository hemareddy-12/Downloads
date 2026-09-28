import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle, 
  MoveUp, 
  MoveDown, 
  Sparkles,
  Layers,
  Search,
  Camera
} from 'lucide-react';
import { 
  getCreations, 
  createCreation, 
  updateCreation, 
  deleteCreation,
  reorderCreations
} from '../../services/creationService';
import { uploadImage } from '../../services/settingsService';

export const AdminCreations = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Model Dress',
    caption: '',
    description: '',
    images: [],
    primaryImage: '',
  });

  // Image Uploading State
  const [uploadingImages, setUploadingImages] = useState(false);

  const defaultCategories = [
    'Model Dress',
    'Custom Blouse',
    'Saree Dress',
    'Half Saree Design',
    'Custom Outfit',
    'Bridal Ensemble',
    'Couture Gown',
  ];

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    setLoading(true);
    try {
      const data = await getCreations();
      setCreations(data || []);
    } catch (err) {
      console.error('Error loading creations:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Model Dress',
      caption: '',
      description: '',
      images: [],
      primaryImage: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    const itemImages = item.images && item.images.length > 0
      ? item.images
      : item.primaryImage ? [item.primaryImage] : [];

    setFormData({
      title: item.title || '',
      category: item.category || 'Custom Outfit',
      caption: item.caption || '',
      description: item.description || '',
      images: itemImages,
      primaryImage: item.primaryImage || itemImages[0] || '',
    });
    setIsModalOpen(true);
  };

  // Handle multiple image files upload
  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadPromises = files.map(file => uploadImage(file, 'creations'));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean);

      setFormData(prev => {
        const combined = [...prev.images, ...validUrls];
        return {
          ...prev,
          images: combined,
          primaryImage: prev.primaryImage || combined[0] || '',
        };
      });
      showNotification(`${validUrls.length} photo(s) uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading images:', err);
      showNotification('Failed to upload images', 'error');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  // Replace single image at index
  const handleReplaceImage = async (index, file) => {
    if (!file) return;
    try {
      setUploadingImages(true);
      const newUrl = await uploadImage(file, 'creations');
      if (newUrl) {
        setFormData(prev => {
          const updated = [...prev.images];
          const oldUrl = updated[index];
          updated[index] = newUrl;
          return {
            ...prev,
            images: updated,
            primaryImage: prev.primaryImage === oldUrl ? newUrl : prev.primaryImage,
          };
        });
        showNotification('Image replaced successfully!');
      }
    } catch (err) {
      console.error('Error replacing image:', err);
      showNotification('Failed to replace image', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove single image at index
  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      const newPrimary = prev.primaryImage === prev.images[index] 
        ? (updated[0] || '') 
        : prev.primaryImage;
      return {
        ...prev,
        images: updated,
        primaryImage: newPrimary,
      };
    });
  };

  // Save creation
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showNotification('Creation title is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        caption: formData.caption.trim(),
        description: formData.description.trim(),
        images: formData.images,
        primaryImage: formData.primaryImage || formData.images[0] || '',
      };

      if (editingId) {
        await updateCreation(editingId, payload);
        showNotification('Creation updated successfully!');
      } else {
        await createCreation(payload);
        showNotification('New creation added to portfolio!');
      }

      setIsModalOpen(false);
      await loadCreations();
    } catch (err) {
      console.error('Error saving creation:', err);
      showNotification('Failed to save creation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete creation
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}" from your portfolio?`)) return;

    try {
      await deleteCreation(id);
      showNotification(`Deleted "${title}"`);
      await loadCreations();
    } catch (err) {
      console.error('Error deleting creation:', err);
      showNotification('Failed to delete creation', 'error');
    }
  };

  // Reorder items
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= creations.length) return;

    const reordered = [...creations];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setCreations(reordered);
    try {
      await reorderCreations(reordered);
      showNotification('Portfolio order updated');
    } catch (err) {
      console.error('Error reordering creations:', err);
    }
  };

  // Filtering
  const filteredCreations = creations.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Design Portfolio & Lookbook</span>
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal mt-1">
            My Creations
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Showcase your personal bespoke outfits, blouses, half sarees, and model dresses. (No prices or checkout; portfolio only).
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-5 py-3 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification.show && (
        <div className={`p-4 rounded-sm border text-xs flex items-center gap-3 transition-all ${
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-sm border border-charcoal-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creations..."
            className="w-full pl-9 pr-4 py-2 border border-charcoal-300 rounded-sm text-xs focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold shrink-0">
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-charcoal-300 rounded-sm text-xs bg-white focus:outline-none focus:border-gold-500 w-full sm:w-auto"
          >
            <option value="All">All Categories</option>
            {defaultCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Creations Table/Cards */}
      {loading ? (
        <div className="text-center py-16 text-charcoal-400 text-xs">Loading creations...</div>
      ) : filteredCreations.length === 0 ? (
        <div className="bg-white border border-charcoal-200 p-12 text-center rounded-sm space-y-4">
          <Sparkles className="w-10 h-10 text-charcoal-300 mx-auto" />
          <h3 className="font-serif text-xl text-charcoal-900">No Creations Added Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-md mx-auto">
            Upload photos of your personal fashion masterpieces, custom blouses, model dresses, and half sarees to display on your lookbook portfolio.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-charcoal-950 text-gold-100 px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-gold-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Creation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((item, index) => {
            const displayImg = item.primaryImage || (item.images && item.images[0]) || '';
            const photoCount = item.images ? item.images.length : (item.primaryImage ? 1 : 0);

            return (
              <div 
                key={item.id} 
                className="bg-white border border-charcoal-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo Display */}
                  <div className="relative aspect-[3/4] w-full bg-charcoal-100 overflow-hidden">
                    {displayImg ? (
                      <img 
                        src={displayImg} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-charcoal-300">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 bg-charcoal-950/80 text-gold-200 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm backdrop-blur-sm">
                      {item.category}
                    </div>

                    {/* Photos Count */}
                    <div className="absolute top-3 right-3 bg-white/90 text-charcoal-900 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded shadow-sm">
                      {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-serif text-lg text-charcoal-950 font-normal leading-snug">
                      {item.title}
                    </h3>

                    {item.caption && (
                      <p className="text-[11px] uppercase tracking-wider text-gold-700 font-semibold">
                        {item.caption}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-charcoal-600 line-clamp-2 font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Reorder & Actions */}
                <div className="p-3 bg-[#FAF8F5] border-t border-charcoal-200 flex items-center justify-between gap-2">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="p-1.5 border border-charcoal-300 rounded hover:bg-white disabled:opacity-30 text-charcoal-600"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === creations.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="p-1.5 border border-charcoal-300 rounded hover:bg-white disabled:opacity-30 text-charcoal-600"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-charcoal-300 rounded-sm text-[11px] uppercase tracking-wider font-semibold text-charcoal-700 hover:bg-white transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-sm text-[11px] uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gold-200 rounded-sm max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-charcoal-200 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-xl text-charcoal-950">
                  {editingId ? 'Edit Creation' : 'Add Creation to Portfolio'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              
              <div>
                <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                  Creation Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Peacock Zardozi Bridal Blouse or Scarlet Silk Gown"
                  className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="creation-categories"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Model Dress, Custom Blouse, Saree Dress"
                    className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                  />
                  <datalist id="creation-categories">
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                    Optional Caption / Note
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="e.g. Handcrafted for Sangeet Night"
                    className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                  Short Description / Craftsmanship Details
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the fabric, embroidery technique, pattern cuts, or styling notes..."
                  className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-3 pt-2 border-t border-charcoal-200">
                <div className="flex items-center justify-between">
                  <label className="uppercase tracking-wider font-semibold text-charcoal-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-gold-600" />
                    <span>Creation Photos ({formData.images.length})</span>
                  </label>
                  <span className="text-[11px] text-charcoal-500">
                    Upload multiple angles/photos
                  </span>
                </div>

                {/* Upload Button */}
                <div className="p-4 border-2 border-dashed border-charcoal-300 rounded-sm bg-[#FAF8F5] text-center space-y-2">
                  <input
                    type="file"
                    id="creation-multiple-upload"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleFilesUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="creation-multiple-upload"
                    className="cursor-pointer inline-flex items-center gap-2 bg-charcoal-950 text-gold-100 hover:bg-gold-700 px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImages ? 'Uploading Photos...' : 'Upload Photos (Single or Multiple)'}</span>
                  </label>
                  <p className="text-[11px] text-charcoal-400">
                    Supports PNG, JPG, WEBP.
                  </p>
                </div>

                {/* Image Gallery with Replace and Delete for each photo */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formData.images.map((imgUrl, index) => {
                      const isPrimary = formData.primaryImage === imgUrl || (!formData.primaryImage && index === 0);

                      return (
                        <div key={index} className="relative aspect-square rounded-sm overflow-hidden border border-charcoal-300 group bg-charcoal-100">
                          <img 
                            src={imgUrl} 
                            alt={`Upload ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge */}
                          {isPrimary && (
                            <span className="absolute top-1 left-1 bg-gold-600 text-charcoal-950 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-charcoal-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="self-end p-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-1">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, primaryImage: imgUrl })}
                                  className="w-full text-[10px] bg-charcoal-800 text-gold-200 py-1 rounded hover:bg-charcoal-700 font-medium"
                                >
                                  Make Cover
                                </button>
                              )}

                              {/* Replace button */}
                              <label className="cursor-pointer w-full block text-center text-[10px] bg-white text-charcoal-900 py-1 rounded hover:bg-gold-50 font-medium">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files[0] && handleReplaceImage(index, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-charcoal-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-charcoal-300 text-charcoal-700 uppercase tracking-wider rounded-sm hover:bg-charcoal-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  className="px-6 py-2.5 bg-charcoal-950 hover:bg-gold-700 text-gold-100 uppercase tracking-wider rounded-sm text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Creation'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
