import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Instagram, 
  MapPin, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

export const AdminContact = () => {
  const { contactSettings, updateContact, brandSettings, updateBrand } = useBrand();

  const [formData, setFormData] = useState({
    whatsapp: '',
    whatsappNumber: '',
    phone: '',
    email: '',
    instagram: '',
    instagramHandle: '',
    address: '',
    contactText: '',
    businessHours: '',
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (contactSettings) {
      setFormData({
        whatsapp: contactSettings.whatsapp || '',
        whatsappNumber: contactSettings.whatsappNumber || '',
        phone: contactSettings.phone || '',
        email: contactSettings.email || '',
        instagram: contactSettings.instagram || '',
        instagramHandle: contactSettings.instagramHandle || '',
        address: contactSettings.address || '',
        contactText: contactSettings.contactText || '',
        businessHours: contactSettings.businessHours || '',
      });
    }
  }, [contactSettings]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto compute whatsappNumber digits if whatsapp changed
      if (name === 'whatsapp') {
        updated.whatsappNumber = value.replace(/[^0-9]/g, '');
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateContact(formData);

      // Keep brandSettings.socialLinks in sync
      if (brandSettings) {
        await updateBrand({
          ...brandSettings,
          socialLinks: {
            ...brandSettings.socialLinks,
            whatsapp: formData.whatsapp,
            whatsappNumber: formData.whatsappNumber,
            phone: formData.phone,
            email: formData.email,
            instagram: formData.instagram,
            instagramHandle: formData.instagramHandle,
            address: formData.address,
            businessHours: formData.businessHours,
          },
        });
      }

      showNotification('Contact details updated successfully!');
    } catch (err) {
      console.error("FULL ERROR:", err);
      const codeStr = err?.code ? ` Code: ${err.code}` : '';
      showNotification(`Failed: ${err?.message || 'Failed to save contact settings'}${codeStr}`, 'error');
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
            <Phone className="w-4 h-4" />
            <span>Communication & Social</span>
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal mt-1">
            Contact Details Settings
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Manage your direct WhatsApp, Instagram, Email, studio address, and contact page text without editing code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-6 py-3 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
          <span>{saving ? 'Saving...' : 'Save Contact Details'}</span>
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

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Direct Channels */}
        <div className="bg-white border border-gold-200/90 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-charcoal-100 pb-3">
            <h3 className="font-serif text-lg text-charcoal-950 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Direct Messaging & Channels</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              These channels power the "Chat on WhatsApp" and customer enquiry buttons across your store.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* WhatsApp */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Number *</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Digits used for WhatsApp link: {formData.whatsappNumber || 'None'}
              </span>
            </div>

            {/* Telephone */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gold-600" />
                <span>Telephone / Mobile Phone</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gold-600" />
                <span>Official Contact Email *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@hemareddy.com"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            {/* Instagram Profile */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram Profile Link</span>
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/hemareddy"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                Instagram Handle (Display Name)
              </label>
              <input
                type="text"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleChange}
                placeholder="@hemareddy"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            {/* Business / Consultation Hours */}
            <div>
              <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-600" />
                <span>Consultation & Atelier Hours</span>
              </label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                placeholder="Mon - Sat: 10:30 AM - 8:00 PM"
                className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

          </div>
        </div>

        {/* Address & Page Description */}
        <div className="bg-white border border-charcoal-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-charcoal-100 pb-3">
            <h3 className="font-serif text-lg text-charcoal-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-600" />
              <span>Studio Address & Contact Page Content</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Customize the message and location shown to customers visiting your contact page.
            </p>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Contact Page Introduction Text
            </label>
            <textarea
              rows={3}
              name="contactText"
              value={formData.contactText}
              onChange={handleChange}
              placeholder="Whether you have an inquiry regarding ready-to-ship silks, bespoke bridal stitching, or an existing order, we are delighted to assist you..."
              className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Physical Studio / Boutique Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Studio hemareddy, Hyderabad, India"
              className="w-full p-3 border border-charcoal-300 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
            />
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-8 py-3.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition shadow-md flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
            <span>Save Contact Details</span>
          </button>
        </div>

      </form>

    </div>
  );
};
