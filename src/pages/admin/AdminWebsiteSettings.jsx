import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Check, 
  Upload, 
  RefreshCw, 
  Palette, 
  Layout, 
  Menu, 
  Eye, 
  EyeOff,
  Sparkles, 
  Phone, 
  Image as ImageIcon,
  Cloud,
  Database,
  Key,
  ShieldCheck,
  ExternalLink,
  Info,
  Server
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { 
  uploadImage, 
  getStorageSettings, 
  saveStorageSettings, 
  testStorageSettings 
} from '../../services/settingsService';

export const AdminWebsiteSettings = () => {
  const { websiteSettings, updateWebsite } = useBrand();

  const [formData, setFormData] = useState({
    homepage: {
      heroHeading: websiteSettings?.homepage?.heroHeading || 'Handcrafted Couture & Bespoke Stitching',
      heroSubtitle: websiteSettings?.homepage?.heroSubtitle || '',
      heroImageUrl: websiteSettings?.homepage?.heroImageUrl || '',
      heroButtonText: websiteSettings?.homepage?.heroButtonText || 'Explore Collections',
      heroButtonLink: websiteSettings?.homepage?.heroButtonLink || '/shop',
      heroSecondaryButtonText: websiteSettings?.homepage?.heroSecondaryButtonText || 'Stitching Services',
      heroSecondaryButtonLink: websiteSettings?.homepage?.heroSecondaryButtonLink || '/stitching',
      categorySectionTitle: websiteSettings?.homepage?.categorySectionTitle || 'Curated Categories',
      categoryDescriptions: {
        sarees: websiteSettings?.homepage?.categoryDescriptions?.sarees || 'Handwoven Silks & Heirloom Drapes',
        'half-sarees': websiteSettings?.homepage?.categoryDescriptions?.['half-sarees'] || 'Traditional Langa Vonis & Festive Ensembles',
        dresses: websiteSettings?.homepage?.categoryDescriptions?.dresses || 'Designer Gowns, Anarkalis & Modern Silhouettes',
      },
      featuredSectionTitle: websiteSettings?.homepage?.featuredSectionTitle || 'Featured Designs',
      newArrivalsSectionTitle: websiteSettings?.homepage?.newArrivalsSectionTitle || 'New Arrivals',
    },
    contact: {
      phone: websiteSettings?.contact?.phone || '+91 98765 43210',
      email: websiteSettings?.contact?.email || 'contact@hemareddy.com',
      whatsapp: websiteSettings?.contact?.whatsapp || '+91 98765 43210',
      whatsappNumber: websiteSettings?.contact?.whatsappNumber || '919876543210',
      address: websiteSettings?.contact?.address || 'Studio hemareddy, Hyderabad, India',
      contactPageInfo: websiteSettings?.contact?.contactPageInfo || 'For appointments, bespoke design consultations, or order inquiries, reach out through phone, email, or WhatsApp.',
      businessHours: websiteSettings?.contact?.businessHours || 'Mon - Sat: 10:30 AM - 8:00 PM',
    },
    social: {
      instagram: websiteSettings?.social?.instagram || 'https://instagram.com/hemareddy',
      instagramHandle: websiteSettings?.social?.instagramHandle || '@hemareddy',
      facebook: websiteSettings?.social?.facebook || '',
      youtube: websiteSettings?.social?.youtube || '',
      other: websiteSettings?.social?.other || '',
    },
    navigation: {
      menuNames: {
        home: websiteSettings?.navigation?.menuNames?.home || 'Home',
        shop: websiteSettings?.navigation?.menuNames?.shop || 'Shop All',
        sarees: websiteSettings?.navigation?.menuNames?.sarees || 'Sarees',
        halfSarees: websiteSettings?.navigation?.menuNames?.halfSarees || 'Half Sarees',
        dresses: websiteSettings?.navigation?.menuNames?.dresses || 'Dresses',
        stitching: websiteSettings?.navigation?.menuNames?.stitching || 'Stitching',
        about: websiteSettings?.navigation?.menuNames?.about || 'About',
        contact: websiteSettings?.navigation?.menuNames?.contact || 'Contact',
      },
      visibleItems: {
        home: websiteSettings?.navigation?.visibleItems?.home ?? true,
        shop: websiteSettings?.navigation?.visibleItems?.shop ?? true,
        sarees: websiteSettings?.navigation?.visibleItems?.sarees ?? true,
        halfSarees: websiteSettings?.navigation?.visibleItems?.halfSarees ?? true,
        dresses: websiteSettings?.navigation?.visibleItems?.dresses ?? true,
        stitching: websiteSettings?.navigation?.visibleItems?.stitching ?? true,
        about: websiteSettings?.navigation?.visibleItems?.about ?? true,
        contact: websiteSettings?.navigation?.visibleItems?.contact ?? true,
      },
      footerText: websiteSettings?.navigation?.footerText || 'Bespoke Haute Couture Atelier & Stitching by hemareddy.',
      footerCopyright: websiteSettings?.navigation?.footerCopyright || 'hemareddy. All rights reserved.',
    },
    appearance: {
      primaryColor: websiteSettings?.appearance?.primaryColor || '#C8A97E',
      secondaryColor: websiteSettings?.appearance?.secondaryColor || '#B5644D',
      backgroundColor: websiteSettings?.appearance?.backgroundColor || '#FAF8F5',
      textColor: websiteSettings?.appearance?.textColor || '#1E1C1A',
    },
  });

  const [activeTab, setActiveTab] = useState('homepage'); // 'homepage' | 'appearance' | 'navigation' | 'contact' | 'storage'
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Permanent Cloud Storage & Image CDN State
  const [storageData, setStorageData] = useState({
    provider: 'auto',
    activeProvider: 'server',
    cloudinary: {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      folder: 'label_hemareddy',
      isConfigured: false,
    },
    imgbb: {
      apiKey: '',
      isConfigured: false,
    },
  });
  const [showSecret, setShowSecret] = useState(false);
  const [testingStorage, setTestingStorage] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [storageSaving, setStorageSaving] = useState(false);
  const [storageMsg, setStorageMsg] = useState('');

  const loadStorageSettings = async () => {
    try {
      const res = await getStorageSettings();
      if (res) {
        setStorageData(prev => ({
          ...prev,
          ...res,
          cloudinary: {
            ...prev.cloudinary,
            ...(res.cloudinary || {}),
            apiSecret: '',
          },
          imgbb: {
            ...prev.imgbb,
            ...(res.imgbb || {}),
          },
        }));
      }
    } catch (err) {
      console.error('Failed to load cloud storage configuration:', err);
    }
  };

  useEffect(() => {
    loadStorageSettings();
  }, []);

  const handleSaveStorage = async (e) => {
    if (e) e.preventDefault();
    setStorageSaving(true);
    setStorageMsg('');
    setError('');
    try {
      await saveStorageSettings({
        provider: storageData.provider,
        cloudinary: {
          cloudName: storageData.cloudinary.cloudName,
          apiKey: storageData.cloudinary.apiKey,
          apiSecret: storageData.cloudinary.apiSecret,
          folder: storageData.cloudinary.folder,
        },
        imgbb: {
          apiKey: storageData.imgbb.apiKey,
        },
      });
      setStorageMsg('Cloud storage settings updated successfully!');
      await loadStorageSettings();
      setTimeout(() => setStorageMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to save cloud storage settings.');
    } finally {
      setStorageSaving(false);
    }
  };

  const handleTestStorage = async () => {
    setTestingStorage(true);
    setTestResult(null);
    try {
      const targetProvider = storageData.provider === 'auto'
        ? (storageData.cloudinary.cloudName ? 'cloudinary' : 'server')
        : storageData.provider;

      const res = await testStorageSettings({
        provider: targetProvider,
        cloudinary: storageData.cloudinary,
        imgbb: storageData.imgbb,
      });
      setTestResult({ success: true, message: res.message, testUrl: res.testUrl });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed. Please verify credentials.',
      });
    } finally {
      setTestingStorage(false);
    }
  };

  // Hero image upload
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file, 'banners');
      setFormData(prev => ({
        ...prev,
        homepage: { ...prev.homepage, heroImageUrl: url },
      }));
      setSuccess('Hero banner uploaded! Click "Save Changes" to apply.');
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      setSaving(true);
      await updateWebsite(formData);
      setSuccess('Website settings saved successfully! All updates are live.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("FULL ERROR:", err);
      const codeStr = err?.code ? ` Code: ${err.code}` : '';
      setError(`Failed: ${err?.message || 'Failed to save website settings'}${codeStr}`);
    } finally {
      setSaving(false);
    }
  };

  // Color Presets for one-click luxury themes
  const colorPresets = [
    { name: 'Warm Gold & Ivory (Default)', primary: '#C8A97E', secondary: '#B5644D', bg: '#FAF8F5', text: '#1E1C1A' },
    { name: 'Rose Gold & Blush', primary: '#B76E79', secondary: '#9D7568', bg: '#FDF9F8', text: '#231F20' },
    { name: 'Royal Emerald & Gold', primary: '#2D5A47', secondary: '#C8A97E', bg: '#F9FBF9', text: '#15221B' },
    { name: 'Regal Maroon & Champagne', primary: '#7A2021', secondary: '#D4A949', bg: '#FAF7F5', text: '#201213' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block">
            Visual & Content Customization
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Website Settings
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Customize homepage headings, button text, theme colours, menu items, and contact information without editing code.
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

      {/* Tabs */}
      <div className="flex border-b border-charcoal-200 space-x-2 sm:space-x-4 text-xs uppercase tracking-wider font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('homepage')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeTab === 'homepage'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Homepage Content
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeTab === 'appearance'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Colours & Appearance
        </button>
        <button
          onClick={() => setActiveTab('navigation')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeTab === 'navigation'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Navigation & Footer
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 ${
            activeTab === 'contact'
              ? 'border-gold-700 text-gold-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          Contact & Social
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 px-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'storage'
              ? 'border-gold-700 text-gold-900 font-bold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-gold-600" />
          <span>Cloud Storage & CDN</span>
          {storageData.cloudinary?.isConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Cloudinary CDN Active" />
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* TAB 1: HOMEPAGE CONTENT */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            
            {/* Hero Section */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
              <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
                Hero Section
              </h3>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Hero Heading *
                </label>
                <input
                  type="text"
                  required
                  value={formData.homepage.heroHeading}
                  onChange={(e) => setFormData({
                    ...formData,
                    homepage: { ...formData.homepage, heroHeading: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.homepage.heroSubtitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    homepage: { ...formData.homepage, heroSubtitle: e.target.value }
                  })}
                  placeholder="Optional subtitle under hero heading..."
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-2">
                <label className="block uppercase font-semibold text-charcoal-700">
                  Hero Background Image (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gold-200 rounded-sm bg-[#FAF8F5]">
                  <label className="cursor-pointer bg-charcoal-900 hover:bg-gold-700 text-gold-100 py-2 px-4 rounded-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Banner Image</span>
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
                  <div className="text-[11px] text-charcoal-500">
                    {formData.homepage.heroImageUrl ? 'Custom banner image active' : 'Using default elegant luxury gradient'}
                  </div>
                  {formData.homepage.heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        homepage: { ...formData.homepage, heroImageUrl: '' }
                      })}
                      className="text-red-500 hover:underline text-[11px] ml-auto"
                    >
                      Reset Banner
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.heroButtonText}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, heroButtonText: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.heroButtonLink}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, heroButtonLink: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.heroSecondaryButtonText}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, heroSecondaryButtonText: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.heroSecondaryButtonLink}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, heroSecondaryButtonLink: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Category & Section Titles */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
              <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
                Section Titles & Category Descriptions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Category Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.categorySectionTitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, categorySectionTitle: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Featured Designs Title
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.featuredSectionTitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: { ...formData.homepage, featuredSectionTitle: e.target.value }
                    })}
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block uppercase font-semibold text-charcoal-700">
                  Category Tagline Descriptions
                </label>
                <div>
                  <span className="text-[11px] text-charcoal-600 block mb-0.5">Sarees Description:</span>
                  <input
                    type="text"
                    value={formData.homepage.categoryDescriptions?.sarees || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: {
                        ...formData.homepage,
                        categoryDescriptions: { ...formData.homepage.categoryDescriptions, sarees: e.target.value }
                      }
                    })}
                    className="w-full p-2 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-charcoal-600 block mb-0.5">Half Sarees Description:</span>
                  <input
                    type="text"
                    value={formData.homepage.categoryDescriptions?.['half-sarees'] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: {
                        ...formData.homepage,
                        categoryDescriptions: { ...formData.homepage.categoryDescriptions, 'half-sarees': e.target.value }
                      }
                    })}
                    className="w-full p-2 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-charcoal-600 block mb-0.5">Dresses Description:</span>
                  <input
                    type="text"
                    value={formData.homepage.categoryDescriptions?.dresses || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      homepage: {
                        ...formData.homepage,
                        categoryDescriptions: { ...formData.homepage.categoryDescriptions, dresses: e.target.value }
                      }
                    })}
                    className="w-full p-2 border border-gold-200 rounded-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COLOURS & APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-6">
            <div>
              <h3 className="font-serif text-lg text-charcoal-900">
                Brand Colours & Palette
              </h3>
              <p className="text-charcoal-500 text-[11px] font-light mt-0.5">
                Customize your website's main brand accent color, secondary accents, background, and text colors. Changes apply immediately upon saving.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="block uppercase font-semibold text-charcoal-700">
                Luxury Color Presets (Click to apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      appearance: {
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                        backgroundColor: preset.bg,
                        textColor: preset.text,
                      }
                    })}
                    className="p-3 border border-gold-200 rounded-sm text-left hover:border-gold-500 transition space-y-1.5 bg-[#FAF8F5]"
                  >
                    <div className="flex gap-1.5">
                      <span className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }}></span>
                      <span className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary }}></span>
                      <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: preset.bg }}></span>
                    </div>
                    <div className="text-[10px] font-semibold text-charcoal-800 leading-tight">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gold-100">
              <div className="flex items-center gap-3 p-3 border border-gold-200 rounded-sm">
                <input
                  type="color"
                  value={formData.appearance.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, primaryColor: e.target.value }
                  })}
                  className="w-10 h-10 border-0 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Main Accent Colour</span>
                  <span className="text-[10px] text-charcoal-500 font-mono">{formData.appearance.primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gold-200 rounded-sm">
                <input
                  type="color"
                  value={formData.appearance.secondaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, secondaryColor: e.target.value }
                  })}
                  className="w-10 h-10 border-0 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Secondary Accent Colour</span>
                  <span className="text-[10px] text-charcoal-500 font-mono">{formData.appearance.secondaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gold-200 rounded-sm">
                <input
                  type="color"
                  value={formData.appearance.backgroundColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, backgroundColor: e.target.value }
                  })}
                  className="w-10 h-10 border-0 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Background Tone</span>
                  <span className="text-[10px] text-charcoal-500 font-mono">{formData.appearance.backgroundColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gold-200 rounded-sm">
                <input
                  type="color"
                  value={formData.appearance.textColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, textColor: e.target.value }
                  })}
                  className="w-10 h-10 border-0 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Body Text Colour</span>
                  <span className="text-[10px] text-charcoal-500 font-mono">{formData.appearance.textColor}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: NAVIGATION & FOOTER */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            
            {/* Menu Titles & Visibility */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
              <div>
                <h3 className="font-serif text-lg text-charcoal-900">
                  Navigation Menu Items
                </h3>
                <p className="text-charcoal-500 text-[11px] font-light mt-0.5">
                  Rename menu labels or show/hide specific sections from the top navigation bar.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'home', label: 'Home Page' },
                  { key: 'shop', label: 'All Collections' },
                  { key: 'sarees', label: 'Sarees' },
                  { key: 'halfSarees', label: 'Half Sarees' },
                  { key: 'dresses', label: 'Dresses' },
                  { key: 'stitching', label: 'Stitching Service' },
                  { key: 'about', label: 'About Page' },
                  { key: 'contact', label: 'Contact Page' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-gold-100 rounded-sm gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={formData.navigation.visibleItems?.[item.key] ?? true}
                        onChange={(e) => setFormData({
                          ...formData,
                          navigation: {
                            ...formData.navigation,
                            visibleItems: { ...formData.navigation.visibleItems, [item.key]: e.target.checked }
                          }
                        })}
                        className="accent-gold-700"
                      />
                      <span className="font-semibold text-charcoal-800 text-xs w-36">{item.label}:</span>
                      <input
                        type="text"
                        value={formData.navigation.menuNames?.[item.key] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          navigation: {
                            ...formData.navigation,
                            menuNames: { ...formData.navigation.menuNames, [item.key]: e.target.value }
                          }
                        })}
                        placeholder={item.label}
                        className="p-1.5 border border-gold-200 rounded-sm bg-white text-xs flex-1 max-w-xs focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-charcoal-400">
                      {formData.navigation.visibleItems?.[item.key] !== false ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Customization */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
              <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
                Footer Information
              </h3>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Footer Description Text
                </label>
                <textarea
                  rows={2}
                  value={formData.navigation.footerText}
                  onChange={(e) => setFormData({
                    ...formData,
                    navigation: { ...formData.navigation, footerText: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Footer Copyright Line
                </label>
                <input
                  type="text"
                  value={formData.navigation.footerCopyright}
                  onChange={(e) => setFormData({
                    ...formData,
                    navigation: { ...formData.navigation, footerCopyright: e.target.value }
                  })}
                  placeholder="hemareddy. All rights reserved."
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CONTACT & SOCIAL */}
        {activeTab === 'contact' && (
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-4">
            <h3 className="font-serif text-lg text-charcoal-900 border-b border-gold-100 pb-2">
              Contact Page & Support Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.contact.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, whatsapp: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.contact.businessHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, businessHours: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Studio Address
                </label>
                <input
                  type="text"
                  value={formData.contact.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, address: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                  Contact Page Explanation Text
                </label>
                <textarea
                  rows={2}
                  value={formData.contact.contactPageInfo}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, contactPageInfo: e.target.value }
                  })}
                  className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERMANENT CLOUD STORAGE & CDN */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`p-6 rounded-sm border shadow-card ${
              storageData.cloudinary?.isConfigured 
                ? 'bg-emerald-50/70 border-emerald-300' 
                : storageData.imgbb?.isConfigured
                ? 'bg-sky-50/70 border-sky-300'
                : 'bg-amber-50/70 border-amber-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  storageData.cloudinary?.isConfigured
                    ? 'bg-emerald-600 text-white'
                    : storageData.imgbb?.isConfigured
                    ? 'bg-sky-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  <Cloud className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-normal text-charcoal-900">
                      {storageData.cloudinary?.isConfigured
                        ? '🟢 Cloudinary Global CDN Active (Permanent Cloud Storage)'
                        : storageData.imgbb?.isConfigured
                        ? '🟢 ImgBB Cloud API Active (Permanent Cloud Storage)'
                        : '🟡 Standalone Server Storage Active'}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-white/80 border border-charcoal-200">
                      Provider: {storageData.activeProvider?.toUpperCase() || 'SERVER'}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-700 font-light mt-1.5 leading-relaxed">
                    {storageData.cloudinary?.isConfigured
                      ? 'All uploaded product images, creations, custom stitching samples, and brand assets are automatically stored permanently on Cloudinary’s worldwide CDN. Deleting files from your local computer will NEVER affect images on the live website.'
                      : storageData.imgbb?.isConfigured
                      ? 'Images are saved permanently to ImgBB cloud storage. Deleting files from your computer will never affect the website.'
                      : 'Images are saved independently on the server with full absolute URLs. For high-speed global delivery and guaranteed lifetime persistence, connect your free Cloudinary account below.'}
                  </p>
                </div>
              </div>
            </div>

            {storageMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{storageMsg}</span>
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-sm border text-xs flex items-start gap-2.5 ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                {testResult.success ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.testUrl && (
                    <p className="mt-1 text-[11px] text-charcoal-600 break-all">
                      Verified URL: <a href={testResult.testUrl} target="_blank" rel="noopener noreferrer" className="underline text-gold-800 font-mono">{testResult.testUrl}</a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Provider Selection & Cloudinary Credentials */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200 shadow-card space-y-6">
              <div className="border-b border-gold-100 pb-4">
                <h3 className="font-serif text-lg text-charcoal-900">
                  Cloudinary Configuration (Recommended)
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-1">
                  Cloudinary provides 25 GB of 100% free permanent cloud storage with global CDN caching.
                </p>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block uppercase font-semibold text-charcoal-700 mb-2">
                  Active Storage Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition ${
                    storageData.provider === 'auto' ? 'border-gold-700 bg-gold-50/50' : 'border-gold-100 hover:border-gold-200'
                  }`}>
                    <input
                      type="radio"
                      name="storageProvider"
                      value="auto"
                      checked={storageData.provider === 'auto'}
                      onChange={(e) => setStorageData({ ...storageData, provider: e.target.value })}
                      className="text-gold-700 focus:ring-gold-500"
                    />
                    <div>
                      <span className="font-semibold text-charcoal-900 block text-xs">Auto (Cloud First)</span>
                      <span className="text-[10px] text-charcoal-500">Cloudinary &rarr; ImgBB &rarr; Server</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition ${
                    storageData.provider === 'cloudinary' ? 'border-gold-700 bg-gold-50/50' : 'border-gold-100 hover:border-gold-200'
                  }`}>
                    <input
                      type="radio"
                      name="storageProvider"
                      value="cloudinary"
                      checked={storageData.provider === 'cloudinary'}
                      onChange={(e) => setStorageData({ ...storageData, provider: e.target.value })}
                      className="text-gold-700 focus:ring-gold-500"
                    />
                    <div>
                      <span className="font-semibold text-charcoal-900 block text-xs">Cloudinary CDN</span>
                      <span className="text-[10px] text-charcoal-500">Global permanent image CDN</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition ${
                    storageData.provider === 'server' ? 'border-gold-700 bg-gold-50/50' : 'border-gold-100 hover:border-gold-200'
                  }`}>
                    <input
                      type="radio"
                      name="storageProvider"
                      value="server"
                      checked={storageData.provider === 'server'}
                      onChange={(e) => setStorageData({ ...storageData, provider: e.target.value })}
                      className="text-gold-700 focus:ring-gold-500"
                    />
                    <div>
                      <span className="font-semibold text-charcoal-900 block text-xs">Atelier Server</span>
                      <span className="text-[10px] text-charcoal-500">Direct server disk storage</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cloudinary Credentials Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Cloud Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storageData.cloudinary?.cloudName || ''}
                    onChange={(e) => setStorageData({
                      ...storageData,
                      cloudinary: { ...storageData.cloudinary, cloudName: e.target.value }
                    })}
                    placeholder="e.g. label-hemareddy or dxyz123"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-600 font-mono text-xs"
                  />
                  <span className="text-[10px] text-charcoal-500 mt-1 block">Found in your Cloudinary Dashboard</span>
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storageData.cloudinary?.apiKey || ''}
                    onChange={(e) => setStorageData({
                      ...storageData,
                      cloudinary: { ...storageData.cloudinary, apiKey: e.target.value }
                    })}
                    placeholder="e.g. 123456789012345"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-600 font-mono text-xs"
                  />
                  <span className="text-[10px] text-charcoal-500 mt-1 block">Your Cloudinary Public API Key</span>
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    API Secret <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={storageData.cloudinary?.apiSecret || ''}
                      onChange={(e) => setStorageData({
                        ...storageData,
                        cloudinary: { ...storageData.cloudinary, apiSecret: e.target.value }
                      })}
                      placeholder={storageData.cloudinary?.hasSecret ? "•••••••••••••••• (Secret saved)" : "Enter API Secret"}
                      className="w-full p-2.5 pr-10 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-600 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-charcoal-500 mt-1 block">
                    {storageData.cloudinary?.hasSecret ? "Secret is securely stored on backend." : "Paste your Cloudinary API Secret"}
                  </span>
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal-700 mb-1">
                    Cloud Folder Name
                  </label>
                  <input
                    type="text"
                    value={storageData.cloudinary?.folder || 'label_hemareddy'}
                    onChange={(e) => setStorageData({
                      ...storageData,
                      cloudinary: { ...storageData.cloudinary, folder: e.target.value }
                    })}
                    placeholder="label_hemareddy"
                    className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-600 font-mono text-xs"
                  />
                  <span className="text-[10px] text-charcoal-500 mt-1 block">Folder on Cloudinary for organization</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gold-100 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestStorage}
                  disabled={testingStorage}
                  className="bg-charcoal-100 hover:bg-gold-100 text-charcoal-900 border border-gold-300 text-xs uppercase tracking-widest font-semibold px-5 py-2.5 rounded-sm transition flex items-center gap-2"
                >
                  {testingStorage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />}
                  <span>{testingStorage ? 'Verifying...' : 'Test Cloud Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStorage}
                  disabled={storageSaving}
                  className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-6 py-2.5 rounded-sm transition flex items-center gap-2 shadow-sm"
                >
                  {storageSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-gold-400" />}
                  <span>{storageSaving ? 'Saving...' : 'Save Cloud Credentials'}</span>
                </button>
              </div>
            </div>

            {/* Quick Setup Instructions Box */}
            <div className="bg-[#FAF8F5] p-6 rounded-sm border border-gold-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-gold-100 pb-2">
                <Info className="w-4 h-4 text-gold-700" />
                <h4 className="font-serif text-sm font-semibold text-charcoal-900">
                  How to create your Free Cloudinary Account (Takes 1 minute)
                </h4>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-charcoal-700 leading-relaxed text-xs">
                <li>
                  Open <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noopener noreferrer" className="text-gold-800 underline font-semibold inline-flex items-center gap-1">cloudinary.com/users/register_free <ExternalLink className="w-3 h-3 inline" /></a> in your browser.
                </li>
                <li>
                  Sign up for a <strong>Free Plan</strong> (No credit card required &bull; 25 GB free storage forever).
                </li>
                <li>
                  Once logged into your Cloudinary Dashboard, locate the box titled <strong>Product Environment Credentials</strong>.
                </li>
                <li>
                  Copy your <strong>Cloud Name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong>.
                </li>
                <li>
                  Paste them into the fields above, click <strong>Test Cloud Connection</strong>, then click <strong>Save Cloud Credentials</strong>.
                </li>
              </ol>
              <div className="mt-3 p-3 bg-white border border-gold-100 rounded-sm text-[11px] text-charcoal-600">
                <strong>Why this is essential:</strong> Once configured, every photo you upload through the Admin Panel is immediately uploaded to Cloudinary&apos;s global servers. You can safely delete or move the photo on your laptop, camera, or phone—the image will remain permanently preserved on your website.
              </div>
            </div>

          </div>
        )}

        {/* Save button at bottom (for non-storage tabs) */}
        {activeTab !== 'storage' && (
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition flex items-center gap-2 shadow-sm"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
              <span>Save All Website Settings</span>
            </button>
          </div>
        )}

      </form>

    </div>
  );
};
