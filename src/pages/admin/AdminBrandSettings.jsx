import React, { useState } from 'react';
import { 
  Upload, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon,
  User,
  Sliders,
  Eye,
  Trash2
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { uploadImage } from '../../services/settingsService';

export const AdminBrandSettings = () => {
  const { brandSettings, updateBrand } = useBrand();

  const [formData, setFormData] = useState({
    brandName: brandSettings?.brandName || 'hemareddy',
    tagline: brandSettings?.tagline || '',
    logoUrl: brandSettings?.logoUrl || '',
    profilePhotoUrl: brandSettings?.profilePhotoUrl || '',
    description: brandSettings?.description || '',
    watermarkSettings: {
      enabled: brandSettings?.watermarkSettings?.enabled ?? true,
      opacity: brandSettings?.watermarkSettings?.opacity ?? 0.05,
      size: brandSettings?.watermarkSettings?.size ?? 480,
      position: brandSettings?.watermarkSettings?.position ?? 'center',
      fixed: brandSettings?.watermarkSettings?.fixed ?? true,
    },
    socialLinks: {
      instagram: brandSettings?.socialLinks?.instagram || 'https://instagram.com/hemareddy',
      instagramHandle: brandSettings?.socialLinks?.instagramHandle || '@hemareddy',
      facebook: brandSettings?.socialLinks?.facebook || '',
      youtube: brandSettings?.socialLinks?.youtube || '',
      whatsapp: brandSettings?.socialLinks?.whatsapp || '+91 98765 43210',
      whatsappNumber: brandSettings?.socialLinks?.whatsappNumber || '919876543210',
      phone: brandSettings?.socialLinks?.phone || '+91 98765 43210',
      email: brandSettings?.socialLinks?.email || 'contact@hemareddy.com',
      address: brandSettings?.socialLinks?.address || 'Studio hemareddy, Hyderabad, India',
      businessHours: brandSettings?.socialLinks?.businessHours || 'Mon - Sat: 10:30 AM - 8:00 PM',
    },
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file, 'brand');
      setFormData(prev => ({ ...prev, logoUrl: url }));
      setSuccess('Logo uploaded! Click "Save Changes" to apply globally.');
    } catch (err) {
      setError('Logo upload failed.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Profile/Brand Photo Upload
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file, 'brand');
      setFormData(prev => ({ ...prev, profilePhotoUrl: url }));
      setSuccess('Profile photo uploaded! Click "Save Changes" to apply.');
    } catch (err) {
      setError('Profile photo upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: val,
      },
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      setSaving(true);
      await updateBrand(formData);
      setSuccess('Brand settings saved successfully! All updates are now active on the website.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to save brand settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Brand Identity
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Brand Settings
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Manage your brand name, tagline, logo, profile photo, description, and contact info without touching code.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        
        {/* 1. Brand Name & Tagline */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
          <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
            1. Brand Name & Tagline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="hemareddy"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 font-medium"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Default: "hemareddy". Appears on header, footer, watermark, and documents.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block uppercase font-semibold text-charcoal-700">
                  Tagline / Quote (Optional)
                </label>
                {formData.tagline && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tagline: '' })}
                    className="text-red-500 hover:text-red-700 text-[10px] flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Tagline</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Leave blank to have no tagline"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                No quote is hardcoded. Only appears if you enter text here.
              </span>
            </div>
          </div>

          <div>
            <label className="block uppercase font-semibold text-charcoal-700 mb-1">
              Short Brand Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A short description about hemareddy brand and clothing label work..."
              className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* 2. Brand Logo & Profile Photo Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-6">
          <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
            2. Brand Logo & Profile Photo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Brand Logo Upload */}
            <div className="space-y-3 p-4 bg-[#FAF8F5] border border-gold-200 rounded-sm">
              <label className="block uppercase font-semibold text-charcoal-800">
                Brand Logo
              </label>

              {formData.logoUrl ? (
                <div className="relative p-4 bg-white border border-gold-200 rounded-sm flex items-center justify-center">
                  <img src={formData.logoUrl} alt="Brand Logo" className="h-14 w-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                    title="Remove logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white border border-dashed border-gold-300 rounded-sm text-center text-charcoal-400 text-xs">
                  No logo uploaded. Text monogram "hemareddy" will be displayed.
                </div>
              )}

              <label className="cursor-pointer w-full bg-charcoal-900 hover:bg-gold-700 text-gold-100 py-2.5 px-3 rounded-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition">
                <Upload className="w-4 h-4" />
                <span>Upload Brand Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            {/* Brand / Profile Photo Upload */}
            <div className="space-y-3 p-4 bg-[#FAF8F5] border border-gold-200 rounded-sm">
              <label className="block uppercase font-semibold text-charcoal-800">
                Brand / Designer Profile Photo
              </label>

              {formData.profilePhotoUrl ? (
                <div className="relative p-2 bg-white border border-gold-200 rounded-sm flex items-center justify-center">
                  <img src={formData.profilePhotoUrl} alt="Profile" className="h-20 w-20 object-cover rounded-full" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profilePhotoUrl: '' })}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white border border-dashed border-gold-300 rounded-sm text-center text-charcoal-400 text-xs">
                  No photo uploaded yet.
                </div>
              )}

              <label className="cursor-pointer w-full bg-charcoal-900 hover:bg-gold-700 text-gold-100 py-2.5 px-3 rounded-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition">
                <Upload className="w-4 h-4" />
                <span>Upload Profile Photo</span>
                <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* 3. Social Media & Contact Details */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
          <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
            3. Social Media & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Instagram Link
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/hemareddy"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Instagram Username / Handle
              </label>
              <input
                type="text"
                value={formData.socialLinks.instagramHandle}
                onChange={(e) => handleSocialChange('instagramHandle', e.target.value)}
                placeholder="@hemareddy"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.socialLinks.whatsapp}
                onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                WhatsApp Numeric Digits (For direct links)
              </label>
              <input
                type="text"
                value={formData.socialLinks.whatsappNumber}
                onChange={(e) => handleSocialChange('whatsappNumber', e.target.value)}
                placeholder="919876543210"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.socialLinks.phone}
                onChange={(e) => handleSocialChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.socialLinks.email}
                onChange={(e) => handleSocialChange('email', e.target.value)}
                placeholder="contact@hemareddy.com"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                Studio Address
              </label>
              <input
                type="text"
                value={formData.socialLinks.address}
                onChange={(e) => handleSocialChange('address', e.target.value)}
                placeholder="Studio hemareddy, Hyderabad, India"
                className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Background Logo Watermark Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gold-100 pb-2">
            <div>
              <h3 className="font-serif text-lg text-charcoal-900">
                4. Background Logo Watermark Controls
              </h3>
              <p className="text-charcoal-500 text-[11px] font-light">
                Subtly watermarks your logo behind website content without interfering with buttons or text readability.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.watermarkSettings.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  watermarkSettings: { ...formData.watermarkSettings, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-charcoal-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-charcoal-700">Opacity: {Math.round(formData.watermarkSettings.opacity * 100)}%</span>
                <span className="text-[10px] text-charcoal-400">Recommended: 3% - 8%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.25"
                step="0.01"
                value={formData.watermarkSettings.opacity}
                onChange={(e) => setFormData({
                  ...formData,
                  watermarkSettings: { ...formData.watermarkSettings, opacity: parseFloat(e.target.value) }
                })}
                className="w-full accent-gold-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-charcoal-700">Display Size: {formData.watermarkSettings.size}px</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="25"
                value={formData.watermarkSettings.size}
                onChange={(e) => setFormData({
                  ...formData,
                  watermarkSettings: { ...formData.watermarkSettings, size: parseInt(e.target.value) }
                })}
                className="w-full accent-gold-600"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition flex items-center gap-2 shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
            <span>Save Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};
