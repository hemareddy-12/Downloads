import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Clock, 
  Tag, 
  Check, 
  X, 
  Upload, 
  AlertCircle,
  Eye,
  Camera,
  RefreshCw,
  Images
} from 'lucide-react';
import { 
  getStitchingServices, 
  createStitchingService, 
  updateStitchingService, 
  deleteStitchingService,
  getStitchingWorkPhotos,
  saveStitchingWorkPhotos
} from '../../services/stitchingService';
import { uploadImage } from '../../services/settingsService';

export const AdminStitching = () => {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'portfolio'
  const [services, setServices] = useState([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', type: 'success' });

  // Service Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    turnaround: '',
    caption: '',
    images: [],
    image: '',
  });
  const [uploadingServiceImages, setUploadingServiceImages] = useState(false);
  const [submittingService, setSubmittingService] = useState(false);

  // Portfolio photo upload state
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [captionEditText, setCaptionEditText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedServices, fetchedPhotos] = await Promise.all([
        getStitchingServices(),
        Promise.resolve(getStitchingWorkPhotos())
      ]);
      setServices(fetchedServices || []);
      setPortfolioPhotos(fetchedPhotos || []);
    } catch (err) {
      console.error('Error loading stitching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setSaveStatus({ show: true, message, type });
    setTimeout(() => {
      setSaveStatus({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  // Open modal for Create or Edit
  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      const serviceImages = Array.isArray(service.images) && service.images.length > 0
        ? service.images
        : (service.image ? [service.image] : []);

      const existingPrice = service.startingPrice || service.price || '';

      setServiceForm({
        title: service.title || '',
        description: service.description || '',
        price: existingPrice,
        startingPrice: existingPrice,
        turnaround: service.turnaround || '',
        caption: service.caption || '',
        images: serviceImages,
        image: serviceImages[0] || '',
      });
    } else {
      setEditingService(null);
      setServiceForm({
        title: '',
        description: '',
        price: '',
        startingPrice: '',
        turnaround: '',
        caption: '',
        images: [],
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  // Handle uploading multiple images for a stitching service
  const handleServiceImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingServiceImages(true);
      const uploadPromises = files.map(file => uploadImage(file, 'stitching-services'));
      const uploadedUrls = await Promise.all(uploadPromises);
      const valid = uploadedUrls.filter(Boolean);

      setServiceForm(prev => {
        const combined = [...prev.images, ...valid];
        return {
          ...prev,
          images: combined,
          image: combined[0] || '',
        };
      });
      showNotification(`${valid.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading service images:', err);
      showNotification('Failed to upload image', 'error');
    } finally {
      setUploadingServiceImages(false);
      e.target.value = '';
    }
  };

  // Replace a specific image of a service
  const handleReplaceServiceImage = async (index, file) => {
    if (!file) return;
    try {
      setUploadingServiceImages(true);
      const newUrl = await uploadImage(file, 'stitching-services');
      if (newUrl) {
        setServiceForm(prev => {
          const updated = [...prev.images];
          updated[index] = newUrl;
          return {
            ...prev,
            images: updated,
            image: updated[0] || '',
          };
        });
        showNotification('Image replaced successfully!');
      }
    } catch (err) {
      console.error('Error replacing image:', err);
      showNotification('Failed to replace image', 'error');
    } finally {
      setUploadingServiceImages(false);
    }
  };

  // Remove a specific image from a service
  const handleRemoveServiceImage = (index) => {
    setServiceForm(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      };
    });
  };

  const toast = {
    success: (msg) => showNotification(msg, 'success'),
    error: (msg) => showNotification(msg, 'error'),
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      toast.error('Service name is required');
      return;
    }

    try {
      setSubmittingService(true);

      // 3. Parse price correctly: extract digits, format with "Starting from ₹${priceNumber}"
      const rawPrice = serviceForm.startingPrice || serviceForm.price || '';
      const priceNumber = String(rawPrice).replace(/[^0-9]/g, '');
      const finalPrice = priceNumber ? `Starting from ₹${priceNumber}` : rawPrice;

      // 2. REMOVE required validation for images - make images optional.
      // If user doesn't upload new images, keep existing images array as is. Do not check if image URL is broken.
      const existingImages = Array.isArray(editingService?.images) && editingService.images.length > 0
        ? editingService.images
        : (editingService?.image ? [editingService.image] : []);

      const finalImages = (Array.isArray(serviceForm.images) && serviceForm.images.length > 0)
        ? serviceForm.images
        : existingImages;

      const payload = {
        title: serviceForm.title.trim(),
        description: (serviceForm.description || '').trim(),
        price: finalPrice,
        startingPrice: finalPrice,
        turnaround: (serviceForm.turnaround || '').trim(),
        caption: (serviceForm.caption || '').trim(),
        images: finalImages,
        image: finalImages[0] || '',
      };

      if (editingService) {
        const editingId = editingService.id;
        console.log('Updating stitching service for editingId:', editingId, payload);
        await updateStitchingService(editingId, payload);

        // 5. After successful update, immediately update UI state:
        setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...payload, startingPrice: finalPrice, price: finalPrice } : s));

        // 6. Add toast.success("Price Updated!")
        toast.success("Price Updated!");
      } else {
        const newService = await createStitchingService(payload);
        if (newService) {
          setServices(prev => [...prev, newService]);
        }
        toast.success("New stitching service created!");
      }

      setIsModalOpen(false);
      // Background reload without overwriting optimistic update
      loadData();
    } catch (err) {
      console.error('Error saving stitching service:', err);
      toast.error(err.message || 'Failed to save service');
    } finally {
      setSubmittingService(false);
    }
  };

  const handleDeleteService = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await deleteStitchingService(id);
      showNotification(`Deleted "${title}"`);
      await loadData();
    } catch (err) {
      console.error('Error deleting service:', err);
      showNotification('Failed to delete service', 'error');
    }
  };

  // ================= Portfolio Handlers =================
  const handlePortfolioFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setNewPhotoFiles(files);
  };

  const handleUploadPortfolioPhotos = async (e) => {
    e.preventDefault();
    if (newPhotoFiles.length === 0) {
      showNotification('Please select one or more photos to upload', 'error');
      return;
    }

    try {
      setUploadingPortfolio(true);
      const uploadPromises = newPhotoFiles.map(file => uploadImage(file, 'stitching-portfolio'));
      const uploadedUrls = await Promise.all(uploadPromises);
      const valid = uploadedUrls.filter(Boolean);

      const newItems = valid.map((url, i) => ({
        id: `work-${Date.now()}-${i}`,
        url,
        caption: newPhotoCaption.trim() || 'Custom Handcrafted Tailoring',
        createdAt: new Date().toISOString(),
      }));

      const updated = [...newItems, ...portfolioPhotos];
      saveStitchingWorkPhotos(updated);
      setPortfolioPhotos(updated);

      setNewPhotoFiles([]);
      setNewPhotoCaption('');
      showNotification(`${valid.length} stitching work photo(s) uploaded!`);
    } catch (err) {
      console.error('Error uploading portfolio photos:', err);
      showNotification('Failed to upload photos', 'error');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleReplacePortfolioPhoto = async (photoId, file) => {
    if (!file) return;
    try {
      const newUrl = await uploadImage(file, 'stitching-portfolio');
      if (newUrl) {
        const updated = portfolioPhotos.map(p => 
          p.id === photoId ? { ...p, url: newUrl } : p
        );
        saveStitchingWorkPhotos(updated);
        setPortfolioPhotos(updated);
        showNotification('Photo replaced successfully!');
      }
    } catch (err) {
      console.error('Error replacing portfolio photo:', err);
      showNotification('Failed to replace photo', 'error');
    }
  };

  const handleDeletePortfolioPhoto = (photoId) => {
    if (!window.confirm('Delete this photo from your portfolio?')) return;
    const updated = portfolioPhotos.filter(p => p.id !== photoId);
    saveStitchingWorkPhotos(updated);
    setPortfolioPhotos(updated);
    showNotification('Photo deleted');
  };

  const handleSaveCaptionEdit = (photoId) => {
    const updated = portfolioPhotos.map(p =>
      p.id === photoId ? { ...p, caption: captionEditText } : p
    );
    saveStitchingWorkPhotos(updated);
    setPortfolioPhotos(updated);
    setEditingCaptionId(null);
    showNotification('Caption updated');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center gap-1.5">
            <Scissors className="w-4 h-4" />
            <span>Atelier & Custom Stitching</span>
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal mt-1">
            Stitching Management
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Manage your stitching services, starting prices, turnaround timelines, and upload photos of your real stitching craftsmanship.
          </p>
        </div>

        {activeTab === 'services' && (
          <button
            type="button"
            onClick={() => openServiceModal()}
            className="inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-5 py-3 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stitching Service</span>
          </button>
        )}
      </div>

      {/* Notification Banner */}
      {saveStatus.show && (
        <div className={`p-4 rounded-sm border text-xs flex items-center gap-3 transition-all ${
          saveStatus.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {saveStatus.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{saveStatus.message}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-charcoal-300 gap-8 text-xs uppercase tracking-widest font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'services'
              ? 'border-gold-600 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Stitching Services ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'portfolio'
              ? 'border-gold-600 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Work Photos Portfolio ({portfolioPhotos.length})</span>
        </button>
      </div>

      {/* Tab 1: Services List */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16 text-charcoal-400 text-xs">Loading stitching services...</div>
          ) : services.length === 0 ? (
            <div className="bg-white border border-charcoal-200 p-12 text-center rounded-sm space-y-4">
              <Scissors className="w-10 h-10 text-charcoal-300 mx-auto" />
              <h3 className="font-serif text-xl text-charcoal-900">No Stitching Services Added Yet</h3>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                Add your custom tailoring offerings such as Blouse Stitching, Maggam Work, Half Saree Stitching, and Designer Gown Tailoring.
              </p>
              <button
                type="button"
                onClick={() => openServiceModal()}
                className="inline-flex items-center gap-2 bg-charcoal-950 text-gold-100 px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-gold-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Service</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const serviceImages = Array.isArray(service.images) && service.images.length > 0 
                  ? service.images 
                  : (service.image ? [service.image] : []);
                const primary = serviceImages[0];

                return (
                  <div 
                    key={service.id} 
                    className="bg-white border border-charcoal-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Service Image */}
                      {primary ? (
                        <div className="aspect-[16/10] w-full overflow-hidden bg-charcoal-100 relative">
                          <img 
                            src={primary} 
                            alt={service.title} 
                            className="w-full h-full object-cover"
                          />
                          {serviceImages.length > 1 && (
                            <span className="absolute top-2 right-2 bg-charcoal-950/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                              {serviceImages.length} Photos
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[16/10] w-full bg-gold-50/60 border-b border-gold-100 flex items-center justify-center text-gold-400">
                          <Scissors className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        <h3 className="font-serif text-lg text-charcoal-950 font-normal leading-snug">
                          {service.title}
                        </h3>

                        {service.caption && (
                          <p className="text-[11px] uppercase tracking-wider text-gold-700 font-semibold">
                            {service.caption}
                          </p>
                        )}

                        <p className="text-xs text-charcoal-600 line-clamp-3 font-light leading-relaxed">
                          {service.description || 'No detailed description provided.'}
                        </p>

                        <div className="pt-2 border-t border-charcoal-100 space-y-1.5 text-xs">
                          {(service.startingPrice || service.price) && (
                            <div className="flex items-center gap-2 text-charcoal-800">
                              <Tag className="w-3.5 h-3.5 text-gold-600" />
                              <span className="font-semibold text-charcoal-950">{service.startingPrice || service.price}</span>
                            </div>
                          )}
                          {service.turnaround && (
                            <div className="flex items-center gap-2 text-charcoal-600 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-gold-600" />
                              <span>{service.turnaround}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-3 bg-[#FAF8F5] border-t border-charcoal-200/80 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openServiceModal(service)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-charcoal-300 rounded-sm text-[11px] uppercase tracking-wider font-semibold text-charcoal-700 hover:bg-white hover:text-charcoal-950 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id, service.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-sm text-[11px] uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Work Photos Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-8">
          
          {/* Upload New Portfolio Work Form */}
          <div className="bg-white border border-gold-200/90 rounded-sm p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg text-charcoal-950 flex items-center gap-2">
              <Camera className="w-5 h-5 text-gold-600" />
              <span>Upload Real Stitching Photos</span>
            </h3>
            <p className="text-xs text-charcoal-600 font-light">
              Showcase photos of blouses, maggam needlework, and custom outfits you personally stitched. All demo model images have been purged.
            </p>

            <form onSubmit={handleUploadPortfolioPhotos} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
              
              <div className="md:col-span-5 space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-charcoal-700">
                  Select Photos (Single or Multiple) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="portfolio-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePortfolioFilesSelected}
                    className="hidden"
                  />
                  <label
                    htmlFor="portfolio-upload"
                    className="cursor-pointer bg-[#FAF8F5] border border-charcoal-300 hover:bg-gold-50 text-charcoal-800 px-4 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-gold-600" />
                    <span>Choose Photos</span>
                  </label>
                  <span className="text-[11px] text-charcoal-500 font-medium">
                    {newPhotoFiles.length > 0 ? `${newPhotoFiles.length} file(s) selected` : 'PNG, JPG, WEBP'}
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-charcoal-700">
                  Caption / Design Note
                </label>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="e.g. Zardozi Peacock Bridal Blouse"
                  className="w-full p-2.5 text-xs border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={uploadingPortfolio || newPhotoFiles.length === 0}
                  className="w-full bg-charcoal-950 hover:bg-gold-700 disabled:opacity-50 text-gold-100 py-2.5 px-4 rounded-sm text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{uploadingPortfolio ? 'Uploading...' : 'Upload to Portfolio'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Existing Photos Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-base text-charcoal-900">
                Uploaded Stitching Photos ({portfolioPhotos.length})
              </h4>
            </div>

            {portfolioPhotos.length === 0 ? (
              <div className="bg-white border border-charcoal-200 p-12 text-center rounded-sm space-y-3">
                <Camera className="w-8 h-8 text-charcoal-300 mx-auto" />
                <p className="text-xs text-charcoal-500">
                  No work photos uploaded yet. Use the form above to upload your stitching craftsmanship.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {portfolioPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className="group relative aspect-square bg-charcoal-100 rounded-sm overflow-hidden border border-charcoal-200 shadow-sm"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption || 'Stitching work'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute inset-0 bg-charcoal-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                      <div className="flex items-center justify-between">
                        {/* Replace photo button */}
                        <label className="cursor-pointer p-1 bg-white/90 text-charcoal-900 rounded hover:bg-white text-[10px] font-medium" title="Replace image">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handleReplacePortfolioPhoto(photo.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>

                        {/* Delete photo button */}
                        <button
                          type="button"
                          onClick={() => handleDeletePortfolioPhoto(photo.id)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Caption display / edit */}
                      {editingCaptionId === photo.id ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={captionEditText}
                            onChange={(e) => setCaptionEditText(e.target.value)}
                            className="w-full p-1 text-[10px] text-charcoal-900 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCaptionEdit(photo.id)}
                            className="w-full bg-gold-600 text-charcoal-950 font-bold text-[9px] py-0.5 rounded"
                          >
                            Save Caption
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingCaptionId(photo.id);
                            setCaptionEditText(photo.caption || '');
                          }}
                          className="cursor-pointer"
                          title="Click to edit caption"
                        >
                          <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                            {photo.caption || 'Click to add caption'}
                          </p>
                          <span className="text-[9px] text-gold-400 block mt-0.5">Edit caption</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Service Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gold-200 rounded-sm max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-charcoal-200 pb-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-xl text-charcoal-950">
                  {editingService ? 'Edit Stitching Service' : 'Add New Stitching Service'}
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

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              
              <div>
                <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Bridal Blouse Stitching & Maggam Work"
                  className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                  Optional Tagline / Caption
                </label>
                <input
                  type="text"
                  value={serviceForm.caption}
                  onChange={(e) => setServiceForm({ ...serviceForm, caption: e.target.value })}
                  placeholder="e.g. Pure Zardozi & Custom Necklines"
                  className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                  Service Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe cuts, necklines, padding, lining, zardozi work included..."
                  className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                    Starting Price
                  </label>
                  <input
                    type="text"
                    value={serviceForm.startingPrice || serviceForm.price || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setServiceForm(prev => ({ ...prev, price: val, startingPrice: val }));
                    }}
                    placeholder="e.g. Starting from ₹500"
                    className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                    Turnaround / Delivery Time
                  </label>
                  <input
                    type="text"
                    value={serviceForm.turnaround}
                    onChange={(e) => setServiceForm({ ...serviceForm, turnaround: e.target.value })}
                    placeholder="e.g. 5-7 business days"
                    className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>
              </div>

              {/* Service Photos (Multiple supported) */}
              <div className="space-y-3 pt-2 border-t border-charcoal-200">
                <div className="flex items-center justify-between">
                  <label className="uppercase tracking-wider font-semibold text-charcoal-800 flex items-center gap-1.5">
                    <Images className="w-4 h-4 text-gold-600" />
                    <span>Service Photos ({serviceForm.images.length})</span>
                  </label>
                  <span className="text-[10px] text-charcoal-500">Upload multiple photos</span>
                </div>

                {/* Upload Button */}
                <div className="p-3 border-2 border-dashed border-charcoal-300 rounded-sm bg-[#FAF8F5] text-center space-y-1">
                  <input
                    type="file"
                    id="service-multi-upload"
                    multiple
                    accept="image/*"
                    onChange={handleServiceImagesUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="service-multi-upload"
                    className="cursor-pointer inline-flex items-center gap-2 bg-charcoal-950 text-gold-100 hover:bg-gold-700 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingServiceImages ? 'Uploading...' : 'Upload Photos'}</span>
                  </label>
                </div>

                {/* Photos List with Replace and Delete */}
                {serviceForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {serviceForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded border border-charcoal-300 group overflow-hidden bg-charcoal-100">
                        <img src={imgUrl} alt={`Service ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-charcoal-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceImage(idx)}
                            className="self-end p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <label className="cursor-pointer w-full text-center text-[9px] bg-white text-charcoal-900 py-0.5 rounded font-medium">
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && handleReplaceServiceImage(idx, e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
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
                  disabled={submittingService || uploadingServiceImages}
                  className="px-6 py-2.5 bg-charcoal-950 hover:bg-gold-700 text-gold-100 uppercase tracking-wider rounded-sm text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingService ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
