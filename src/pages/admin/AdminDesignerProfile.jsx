import React, { useState } from 'react';
import { Upload, Check, User, Sparkles, RefreshCw } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { uploadImage } from '../../services/settingsService';

export const AdminDesignerProfile = () => {
  const { designerProfile, updateDesigner } = useBrand();

  const [formData, setFormData] = useState({
    name: designerProfile?.name || 'Hema Reddy',
    title: designerProfile?.title || 'Founder, Creative Director & Master Couturier',
    photoUrl: designerProfile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800',
    intro: designerProfile?.intro || '',
    passion: designerProfile?.passion || '',
    story: designerProfile?.story || '',
    journey: designerProfile?.journey || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'designer-profile');
      setFormData(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      setError('Photo upload failed. Please try another image.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);
      await updateDesigner(formData);
      setSuccess('Designer profile and story updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to update designer profile.');
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
            Couturier Spotlight
          </span>
          <h1 className="font-serif text-3xl text-charcoal-950 font-normal">
            Meet the Designer Profile
          </h1>
          <p className="text-xs text-charcoal-600 font-light mt-1">
            Update your profile portrait, stitching philosophy, design work, and Label HemaReddy brand journey.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-gold-400" />}
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
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

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-sm border border-gold-200/80 shadow-card space-y-6 text-xs">
        
        {/* Profile Photo Upload */}
        <div className="space-y-3">
          <label className="block uppercase font-semibold text-charcoal-800">
            Designer Profile Portrait Photo
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-gold-200 rounded-sm bg-[#FAF8F5]">
            <div className="relative w-24 h-32 rounded-sm overflow-hidden border-2 border-gold-300 shadow-sm shrink-0 bg-charcoal-100">
              <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover object-top" />
            </div>

            <div className="space-y-2 flex-1">
              <label className="cursor-pointer bg-charcoal-900 hover:bg-gold-700 text-gold-100 px-4 py-2 rounded-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition">
                <Upload className="w-4 h-4" />
                <span>Upload New Portrait Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-charcoal-500 font-light">
                High resolution portrait recommended. Updates instantly across Homepage and About page.
              </p>
              <div>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="Or enter image URL..."
                  className="w-full p-2 bg-white border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name and Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase font-semibold text-charcoal-700 mb-1">
              Designer Name *
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Hema Reddy"
              className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 font-serif text-sm"
            />
          </div>

          <div>
            <label className="block uppercase font-semibold text-charcoal-700 mb-1">
              Professional Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Founder & Master Couturier"
              className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Short Intro */}
        <div>
          <label className="block uppercase font-semibold text-charcoal-700 mb-1">
            Short Introduction Quote
          </label>
          <input
            type="text"
            name="intro"
            value={formData.intro}
            onChange={handleChange}
            placeholder="Crafting bespoke heirloom silhouettes with timeless craftsmanship and modern grace."
            className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500 font-serif text-xs italic"
          />
        </div>

        {/* Passion for Fashion & Stitching */}
        <div>
          <label className="block uppercase font-semibold text-charcoal-700 mb-1">
            My Passion for Fashion & Stitching
          </label>
          <textarea
            rows={3}
            name="passion"
            value={formData.passion}
            onChange={handleChange}
            placeholder="Describe your love for fabrics, tailoring, precision cuts, and South Asian aesthetics..."
            className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Personal Stitching Story */}
        <div>
          <label className="block uppercase font-semibold text-charcoal-700 mb-1">
            My Personal Stitching & Design Story
          </label>
          <textarea
            rows={4}
            name="story"
            value={formData.story}
            onChange={handleChange}
            placeholder="Share how you began stitching, working with handlooms, and developing your craft..."
            className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* The Label HemaReddy Journey */}
        <div>
          <label className="block uppercase font-semibold text-charcoal-700 mb-1">
            My Label HemaReddy Journey
          </label>
          <textarea
            rows={4}
            name="journey"
            value={formData.journey}
            onChange={handleChange}
            placeholder="How Label HemaReddy was established and your vision for bespoke couture..."
            className="w-full p-2.5 border border-gold-200 rounded-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="pt-4 border-t border-gold-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-charcoal-950 hover:bg-gold-700 text-gold-100 px-8 py-3 rounded-sm uppercase tracking-wider font-semibold transition"
          >
            {saving ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
};
