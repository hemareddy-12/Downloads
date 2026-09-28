import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Instagram, 
  Send, 
  CheckCircle, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import { submitContactMessage } from '../services/enquiryService';

export const ContactPage = () => {
  const { brandSettings, contactSettings } = useBrand();
  const brandName = brandSettings?.brandName || 'hemareddy';
  
  // Prefer contactSettings with fallback to brandSettings.socialLinks
  const contact = {
    whatsapp: contactSettings?.whatsapp || brandSettings?.socialLinks?.whatsapp || '+91 98765 43210',
    whatsappNumber: contactSettings?.whatsappNumber || brandSettings?.socialLinks?.whatsappNumber || '919876543210',
    phone: contactSettings?.phone || brandSettings?.socialLinks?.phone || '+91 98765 43210',
    email: contactSettings?.email || brandSettings?.socialLinks?.email || 'contact@hemareddy.com',
    instagram: contactSettings?.instagram || brandSettings?.socialLinks?.instagram || 'https://instagram.com/hemareddy',
    instagramHandle: contactSettings?.instagramHandle || brandSettings?.socialLinks?.instagramHandle || '@hemareddy',
    address: contactSettings?.address || brandSettings?.socialLinks?.address || 'Studio hemareddy, Hyderabad, India',
    contactText: contactSettings?.contactText || 'Whether you have an inquiry regarding ready-to-ship silks, bespoke bridal stitching, or an existing order, we are delighted to assist you.',
    businessHours: contactSettings?.businessHours || brandSettings?.socialLinks?.businessHours || 'Mon - Sat: 10:30 AM - 8:00 PM',
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email address, and message.');
      return;
    }

    try {
      setSubmitting(true);
      await submitContactMessage(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit message:', err);
      setError('Message could not be sent. Please contact us on WhatsApp directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
          Atelier Communication
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-950 font-normal">
          Connect With {brandName}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
          {contact.contactText}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Column */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-8 rounded-sm border border-gold-200/90 shadow-card space-y-6">
            <h3 className="font-serif text-xl text-charcoal-900 border-b border-gold-100 pb-3">
              Direct Channels & Studio
            </h3>

            <div className="space-y-5 text-xs text-charcoal-700">
              
              {/* WhatsApp Direct */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-sm shrink-0 border border-emerald-200">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Direct WhatsApp</h5>
                  <p className="font-light text-charcoal-500 mt-0.5">Quick design consultations & updates</p>
                  <a 
                    href={`https://wa.me/${contact.whatsappNumber}?text=Hello%20${encodeURIComponent(brandName)},%20I%20would%20like%20to%20enquire%20about%20your%20services.`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 hover:text-emerald-700 underline mt-1 inline-block"
                  >
                    Chat on WhatsApp ({contact.whatsapp})
                  </a>
                </div>
              </div>

              {/* Instagram */}
              {contact.instagram && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-sm shrink-0 border border-pink-200">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Instagram Lookbook</h5>
                    <p className="font-light text-charcoal-500 mt-0.5">Latest reels, client fits & behind-the-scenes</p>
                    <a 
                      href={contact.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-pink-600 hover:text-pink-700 underline mt-1 inline-block"
                    >
                      {contact.instagramHandle || 'View Instagram Profile'}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-gold-50 text-gold-700 rounded-sm shrink-0 border border-gold-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Email Address</h5>
                  <a href={`mailto:${contact.email}`} className="font-light text-charcoal-600 hover:text-gold-700 transition block mt-0.5">
                    {contact.email}
                  </a>
                </div>
              </div>

              {/* Telephone */}
              {contact.phone && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-gold-50 text-gold-700 rounded-sm shrink-0 border border-gold-200">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Telephone</h5>
                    <a href={`tel:${contact.phone}`} className="font-light text-charcoal-600 hover:text-gold-700 transition block mt-0.5">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Studio Address */}
              {contact.address && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-gold-50 text-gold-700 rounded-sm shrink-0 border border-gold-200">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Studio Atelier</h5>
                    <p className="font-light text-charcoal-600 mt-0.5 leading-relaxed">
                      {contact.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {contact.businessHours && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-gold-50 text-gold-700 rounded-sm shrink-0 border border-gold-200">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold uppercase tracking-wider text-charcoal-900">Studio Hours</h5>
                    <p className="font-light text-charcoal-600 mt-0.5">
                      {contact.businessHours}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="p-6 bg-[#FAF6F0] rounded-sm border border-gold-200 text-xs text-charcoal-600 space-y-2">
            <span className="font-semibold uppercase tracking-wider text-charcoal-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-700" />
              <span>Bespoke Sizing Guarantee</span>
            </span>
            <p className="font-light leading-relaxed">
              Every custom blouse and ensemble stitched by {brandName} includes complimentary alteration checks to ensure your outfit fits impeccably.
            </p>
          </div>

        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 sm:p-12 rounded-sm border border-gold-200/90 shadow-card">
            
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-charcoal-950">Message Sent Successfully</h3>
                <p className="text-xs text-charcoal-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to {brandName}. We have received your inquiry and will respond to you via WhatsApp or Email promptly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
                    }}
                    className="text-xs uppercase tracking-widest text-gold-800 hover:underline font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                
                <div className="border-b border-gold-100 pb-4">
                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal">
                    Send An Atelier Inquiry
                  </h3>
                  <p className="text-xs text-charcoal-500 font-light mt-1">
                    Fill out the form below for order status, custom stitching queries, or fabric advice.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="radhika@example.com"
                      className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 border border-gold-200 rounded-sm bg-white focus:outline-none focus:border-gold-500 text-xs"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Custom Stitching / Atelier Inquiry">Custom Stitching / Atelier Inquiry</option>
                      <option value="Existing Order Status">Existing Order Status</option>
                      <option value="Bridal Consultation">Bridal Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we assist you today? Feel free to ask about custom designs, fabric availability, or deadlines..."
                    className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-8 py-3.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 shadow-luxury"
                >
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>{submitting ? 'Sending Message...' : 'Send Atelier Message'}</span>
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
