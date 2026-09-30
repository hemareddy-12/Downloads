import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Ruler, 
  Sparkles, 
  Upload, 
  CheckCircle, 
  MessageCircle, 
  Clock, 
  Tag,
  ShieldCheck,
  Camera,
  ArrowRight
} from 'lucide-react';
import { submitCustomEnquiry } from '../services/enquiryService';
import { uploadImage } from '../services/settingsService';
import { getStitchingServices, getStitchingWorkPhotos } from '../services/stitchingService';
import { useBrand } from '../context/BrandContext';

export const CustomStitchingPage = () => {
  const { brandSettings, designerProfile } = useBrand();
  const brandName = brandSettings?.brandName || 'hemareddy';
  const social = brandSettings?.socialLinks || {};

  const [services, setServices] = useState([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    outfitType: 'Bridal Blouse (Maggam / Aari Work)',
    eventDate: '',
    measurementsType: 'Provide via WhatsApp / Video Call',
    measurementsNotes: '',
    message: '',
    referenceImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, photosData] = await Promise.all([
          getStitchingServices(),
          Promise.resolve(getStitchingWorkPhotos()),
        ]);
        setServices(servicesData || []);
        setPortfolioPhotos(photosData || []);
      } catch (e) {
        console.error('Error fetching stitching services or photos:', e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectServiceForEnquiry = (serviceTitle) => {
    setFormData(prev => ({ ...prev, outfitType: serviceTitle }));
    const formEl = document.getElementById('enquiry-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, referenceImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName || !formData.phone) {
      setError('Please provide your name and contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      let uploadedImageUrl = '';

      if (formData.referenceImage) {
        uploadedImageUrl = await uploadImage(formData.referenceImage, 'enquiry-references');
      }

      await submitCustomEnquiry({
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        outfitType: formData.outfitType,
        eventDate: formData.eventDate,
        measurementsType: formData.measurementsType,
        measurementsNotes: formData.measurementsNotes,
        message: formData.message,
        referenceImageUrl: uploadedImageUrl,
      });

      setSubmitted(true);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      setError('Enquiry submission failed. Please try again or message us on WhatsApp directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-20">
      
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center justify-center gap-1.5">
          <Scissors className="w-4 h-4" />
          <span>Haute Couture Made-To-Measure Atelier</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-charcoal-950 font-normal leading-tight">
          Custom Stitching & Bespoke Design
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
          Because authentic luxury is made to fit only you. Every cut, embroidery stitch, and neckline curve is personally designed and supervised by <strong className="font-medium text-charcoal-900">{designerProfile?.name || 'Hema Reddy'}</strong> at <strong className="font-medium text-charcoal-900">{brandName}</strong>.
        </p>
      </div>

      {/* 2. Dynamic Stitching Services & Pricing Cards */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
            Our Atelier Offerings
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
            Stitching Services & Turnaround
          </h2>
          <p className="text-xs text-charcoal-500 font-light">
            Select a service below to book your consultation or calculate custom tailoring for your fabric.
          </p>
        </div>

        {services.length === 0 && !loadingData ? (
          <div className="bg-white border border-gold-200 p-8 text-center rounded-sm text-xs text-charcoal-500">
            Stitching service details will appear here once added in the Admin Panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-sm border border-gold-200/80 shadow-card hover:shadow-luxury transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {service.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-charcoal-100">
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <h3 className="font-serif text-xl text-charcoal-950 leading-snug">
                      {service.title}
                    </h3>
                    
                    <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-3 border-t border-gold-100 space-y-2 text-xs">
                      {(service.startingPrice || service.price) && (
                        <div className="flex items-center gap-2 text-charcoal-900 font-semibold">
                          <Tag className="w-3.5 h-3.5 text-gold-600" />
                          <span>{service.startingPrice || service.price}</span>
                        </div>
                      )}
                      {service.turnaround && (
                        <div className="flex items-center gap-2 text-charcoal-600 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          <span>Delivery time: {service.turnaround}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] border-t border-gold-200/60">
                  <button
                    type="button"
                    onClick={() => handleSelectServiceForEnquiry(service.title)}
                    className="w-full py-2.5 px-4 bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-[11px] uppercase tracking-wider font-semibold rounded-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Enquire For This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Real Stitching Work / Portfolio Showcase (If photos exist) */}
      {portfolioPhotos.length > 0 && (
        <div className="space-y-8 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Real Work & Craftsmanship</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
              Portfolio & Sample Designs
            </h2>
            <p className="text-xs text-charcoal-500 font-light">
              Glimpse into handcrafted blouses, delicate Maggam needlework, and custom bridal silhouettes created at our atelier.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {portfolioPhotos.map((photo) => (
              <div 
                key={photo.id}
                className="group relative aspect-square rounded-sm overflow-hidden border border-gold-200 shadow-sm bg-charcoal-100"
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Stitching Work'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-xs text-white font-medium leading-tight">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. The 4-Step Consultation Process */}
      <div className="bg-[#FAF6F0] border border-gold-200 p-8 sm:p-12 rounded-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
            How It Works
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
            The Custom Journey with {designerProfile?.name || 'Hema Reddy'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <span className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-200 font-serif font-bold text-sm flex items-center justify-center mx-auto">
              01
            </span>
            <h4 className="font-serif text-base text-charcoal-900">Submit Details</h4>
            <p className="text-xs text-charcoal-600 font-light">Fill out the consultation form below or share reference photos.</p>
          </div>

          <div className="space-y-2">
            <span className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-200 font-serif font-bold text-sm flex items-center justify-center mx-auto">
              02
            </span>
            <h4 className="font-serif text-base text-charcoal-900">Design Talk</h4>
            <p className="text-xs text-charcoal-600 font-light">Direct phone/WhatsApp talk with {designerProfile?.name || 'Hema Reddy'} to discuss fabric, cuts, & deadline.</p>
          </div>

          <div className="space-y-2">
            <span className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-200 font-serif font-bold text-sm flex items-center justify-center mx-auto">
              03
            </span>
            <h4 className="font-serif text-base text-charcoal-900">Handcrafting</h4>
            <p className="text-xs text-charcoal-600 font-light">Precision pattern making, embroidery tracing, and atelier stitching.</p>
          </div>

          <div className="space-y-2">
            <span className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-200 font-serif font-bold text-sm flex items-center justify-center mx-auto">
              04
            </span>
            <h4 className="font-serif text-base text-charcoal-900">Insured Delivery</h4>
            <p className="text-xs text-charcoal-600 font-light">Steamed, packaged in heirloom dustbags, and delivered to your doorstep.</p>
          </div>
        </div>
      </div>

      {/* 5. Consultation & Custom Stitching Form */}
      <div id="enquiry-form" className="bg-white border border-gold-200/90 rounded-sm p-8 sm:p-12 shadow-luxury max-w-4xl mx-auto">
        
        {submitted ? (
          <div className="text-center py-12 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest-luxury text-gold-700 font-semibold block">
                Enquiry Successfully Received
              </span>
              <h3 className="font-serif text-3xl text-charcoal-950 font-normal">
                Thank You, {formData.customerName}!
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                {designerProfile?.name || 'Hema Reddy'} and our master stitching team have received your bespoke request. We will review your requirements and reach out to you via WhatsApp / Phone within 24 hours.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${social.whatsappNumber || '919876543210'}?text=Hello%20Hema%20Reddy,%20I%20just%20submitted%20a%20custom%20stitching%20enquiry%20for%20${encodeURIComponent(formData.outfitType)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-emerald-600 text-white px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp Directly</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs uppercase tracking-wider text-charcoal-600 hover:text-gold-700 underline px-4 py-2"
              >
                Submit Another Consultation
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-1 border-b border-gold-100 pb-6">
              <h3 className="font-serif text-2xl sm:text-3xl text-charcoal-950 font-normal">
                Custom Stitching Enquiry Form
              </h3>
              <p className="text-xs text-charcoal-500 font-light">
                Fill out the form below. {designerProfile?.name || 'Hema Reddy'} will personally review your design request.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              
              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="radhika@example.com"
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Target Occasion / Wedding Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Bespoke Outfit / Stitching Service Selected *
                </label>
                <input
                  type="text"
                  name="outfitType"
                  required
                  value={formData.outfitType}
                  onChange={handleChange}
                  placeholder="e.g. Bridal Blouse Stitching, Maggam Work, Half Saree, Dress..."
                  className="w-full p-3 border border-gold-200 rounded-sm bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  How would you prefer to provide measurements?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-3 border border-gold-200 rounded-sm cursor-pointer hover:bg-gold-50/50">
                    <input
                      type="radio"
                      name="measurementsType"
                      value="Provide via WhatsApp / Video Call"
                      checked={formData.measurementsType === 'Provide via WhatsApp / Video Call'}
                      onChange={handleChange}
                      className="accent-gold-700"
                    />
                    <span>WhatsApp Guided / Video Call</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gold-200 rounded-sm cursor-pointer hover:bg-gold-50/50">
                    <input
                      type="radio"
                      name="measurementsType"
                      value="I will type my measurements below"
                      checked={formData.measurementsType === 'I will type my measurements below'}
                      onChange={handleChange}
                      className="accent-gold-700"
                    />
                    <span>I will type my measurements below</span>
                  </label>
                </div>
              </div>

              {formData.measurementsType === 'I will type my measurements below' && (
                <div className="sm:col-span-2">
                  <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                    Enter Measurements (Bust, Waist, Hips, Shoulder, Sleeve Length, etc.)
                  </label>
                  <textarea
                    name="measurementsNotes"
                    rows={3}
                    value={formData.measurementsNotes}
                    onChange={handleChange}
                    placeholder="Bust: 36 inches, Waist: 30 inches, Blouse Length: 14 inches, Sleeve: 11 inches, Front neck: 7 inches..."
                    className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Specific Design Requirements, Embroidery or Vision
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about the fabric you have, your preferred necklines, sleeve work, or colour combinations..."
                  className="w-full p-3 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Reference Image Upload */}
              <div className="sm:col-span-2">
                <label className="block text-charcoal-700 uppercase tracking-wider font-semibold mb-1">
                  Upload Reference Photo / Sketch (Optional)
                </label>
                <div className="mt-1 flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gold-300 rounded-sm bg-[#FAF8F5]">
                  <input
                    type="file"
                    id="ref-img"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="ref-img"
                    className="cursor-pointer bg-white border border-gold-300 hover:bg-gold-50 text-charcoal-800 px-4 py-2 rounded-sm text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-gold-600" />
                    <span>Choose Image</span>
                  </label>
                  <span className="text-[11px] text-charcoal-500">
                    PNG, JPG, or WEBP up to 10MB
                  </span>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-gold-300 ml-auto shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gold-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Private & confidential atelier consultation</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-semibold transition shadow-luxury flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4 text-gold-400" />
                <span>{submitting ? 'Submitting Enquiry...' : 'Book Design Consultation'}</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
