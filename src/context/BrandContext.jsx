import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getBrandSettings, 
  saveBrandSettings, 
  getWebsiteSettings, 
  saveWebsiteSettings,
  getAboutSettings,
  saveAboutSettings,
  getContactSettings,
  saveContactSettings
} from '../services/settingsService';
import { 
  initialBrandSettings, 
  initialWebsiteSettings,
  initialAboutSettings,
  initialContactSettings
} from '../utils/initialData';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brandSettings, setBrandSettings] = useState(initialBrandSettings);
  const [websiteSettings, setWebsiteSettings] = useState(initialWebsiteSettings);
  const [aboutSettings, setAboutSettings] = useState(initialAboutSettings);
  const [contactSettings, setContactSettings] = useState(initialContactSettings);
  const [loading, setLoading] = useState(true);

  // Apply dynamic colors to document :root
  const applyColors = (appearance) => {
    if (!appearance) return;
    const root = document.documentElement;
    if (appearance.primaryColor) {
      root.style.setProperty('--color-primary', appearance.primaryColor);
    }
    if (appearance.secondaryColor) {
      root.style.setProperty('--color-secondary', appearance.secondaryColor);
    }
    if (appearance.backgroundColor) {
      root.style.setProperty('--color-bg', appearance.backgroundColor);
      document.body.style.backgroundColor = appearance.backgroundColor;
    }
    if (appearance.textColor) {
      root.style.setProperty('--color-text', appearance.textColor);
      document.body.style.color = appearance.textColor;
    }
  };

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const [brand, website, about, contact] = await Promise.all([
          getBrandSettings(),
          getWebsiteSettings(),
          getAboutSettings(),
          getContactSettings(),
        ]);
        if (brand) setBrandSettings(brand);
        if (about) setAboutSettings(about);
        if (contact) setContactSettings(contact);
        if (website) {
          setWebsiteSettings(website);
          applyColors(website.appearance);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllSettings();
  }, []);

  const updateBrand = async (newSettings) => {
    const updated = await saveBrandSettings(newSettings);
    setBrandSettings(updated);
    return updated;
  };

  const updateWebsite = async (newSettings) => {
    const updated = await saveWebsiteSettings(newSettings);
    setWebsiteSettings(updated);
    if (updated.appearance) {
      applyColors(updated.appearance);
    }
    return updated;
  };

  const updateAbout = async (newSettings) => {
    const updated = await saveAboutSettings(newSettings);
    setAboutSettings(updated);
    return updated;
  };

  const updateContact = async (newSettings) => {
    const updated = await saveContactSettings(newSettings);
    setContactSettings(updated);
    return updated;
  };

  return (
    <BrandContext.Provider
      value={{
        brandSettings,
        websiteSettings,
        aboutSettings,
        contactSettings,
        designerProfile: aboutSettings, // Backward compatibility alias
        updateBrand,
        updateWebsite,
        updateAbout,
        updateContact,
        updateDesigner: updateAbout, // Backward compatibility alias
        loading,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
