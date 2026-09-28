import React, { useState, useEffect } from 'react';
import { 
  User, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Quote, 
  Sparkles,
  Camera,
  RefreshCw
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { uploadImage } from '../../services/settingsService';

export const AdminAbout = () => {
  const { aboutSettings, updateAbout } = useBrand();

  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    photoUrl: '',
    quotation: '',
    introduction: '',
    story: '',
    passion: '',
    promise: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (aboutSettings) {
      setFormData({
        heading: aboutSettings.heading || 'About Me',
        subheading: aboutSettings.subheading || '',
        photoUrl: aboutSettings.photoUrl || '',
        quotation: aboutSettings.quotation || '',
        introduction: aboutSettings.introduction || '',
        story: aboutSettings.story || '',
        passion: aboutSettings.passion || '',
        promise: aboutSettings.promise || '',
      });
    }
  }, [aboutSettings]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const url = await uploadImage(file, 'about-profile');
      if (url) {
        setFormData(prev => ({ ...prev, photoUrl: url }));
        showNotification('Photo uploaded successfully! Remember to save changes.');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      showNotification('Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    showNotification('Photo removed. Save changes to update.');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAbout(formData);
      showNotification('About section updated successfully!');
    } catch (err) {
      console.error('Error saving about settings:', err);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>Profile & Brand Story</span>
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal mt-1">
            About Me Settings
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Upload your personal photo, edit your introduction, and customize your personal quotation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingPhoto}
          className="inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-3 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
          <span>{saving ? 'Saving...' : 'Save About Changes'}</span>
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

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Photo Management Card */}
        <div className="bg-white border border-gold-200/90 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-charcoal-100 pb-3">
            <h3 className="font-serif text-lg text-charcoal-950 flex items-center gap-2">
              <Camera className="w-5 h-5 text-gold-600" />
              <span>Personal Profile Photo</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Upload your own photo to be displayed on the About Me page. No demo model photos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Photo Preview */}
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-sm overflow-hidden border-2 border-dashed border-gold-300 bg-[#FAF8F5] shrink-0 flex items-center justify-center shadow-sm">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-charcoal-400">
                  <User className="w-12 h-12 mx-auto mb-1 opacity-40 text-gold-600" />
                  <span className="text-[11px] block">No Photo Uploaded</span>
                </div>
              )}
            </div>

            {/* Photo Actions */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  id="about-photo-file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="about-photo-file"
                  className="cursor-pointer bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-5 py-2.5 rounded-sm uppercase tracking-wider font-semibold flex items-center gap-2 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>{formData.photoUrl ? 'Replace Photo' : 'Upload My Photo'}</span>
                </label>

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-sm uppercase tracking-wider font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Photo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-charcoal-500 leading-relaxed">
                Recommended: A high-quality portrait photo in PNG, JPG, or WEBP format. Will be stored securely and displayed prominently on your About Me page.
              </p>
            </div>
          </div>
        </div>

        {/* Headings & Quotation Card */}
        <div className="bg-white border border-charcoal-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm text-xs">
          <div className="border-b border-charcoal-100 pb-3">
            <h3 className="font-serif text-lg text-charcoal-950 flex items-center gap-2">
              <Quote className="w-5 h-5 text-gold-600" />
              <span>Heading, Introduction & Quotation</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Customize the titles and personal quote shown below your portrait.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                About Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                placeholder="e.g. About Me"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                Subheading / Tagline
              </label>
              <input
                type="text"
                name="subheading"
                value={formData.subheading}
                onChange={handleChange}
                placeholder="e.g. Where Heritage Weaves Meet Precision Haute Couture"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>
          </div>

          {/* Quotation Field */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-gold-600" />
              <span>Personal Quotation (Editable at any time)</span>
            </label>
            <textarea
              rows={2}
              name="quotation"
              value={formData.quotation}
              onChange={handleChange}
              placeholder="e.g. Crafting bespoke heirloom silhouettes with timeless craftsmanship and modern grace."
              className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 font-serif italic text-sm text-charcoal-900"
            />
            <span className="text-[10px] text-charcoal-400 mt-1 block">
              Leave blank if you do not want to display a quote.
            </span>
          </div>

          {/* Introduction Field */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Introduction Text
            </label>
            <textarea
              rows={3}
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              placeholder="Write a brief introduction about yourself and your personal fashion label..."
              className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
            />
          </div>

          {/* Detailed Story & Passion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-charcoal-100">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                Story Behind the Needle
              </label>
              <textarea
                rows={3}
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Share how you started designing and tailoring..."
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                Passion for Fashion & Stitching
              </label>
              <textarea
                rows={3}
                name="passion"
                value={formData.passion}
                onChange={handleChange}
                placeholder="Share your philosophy on fabrics, fit, and embroidery..."
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingPhoto}
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-8 py-3.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
            <span>Save About Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};
