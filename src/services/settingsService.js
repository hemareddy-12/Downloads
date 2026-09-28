import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { 
  initialBrandSettings, 
  initialWebsiteSettings, 
  initialAboutSettings, 
  initialContactSettings 
} from '../utils/initialData';
import { apiGet, apiPut, apiPost } from './apiClient';

const SETTINGS_COLLECTION = 'settings';
const BRAND_DOC = 'brand';
const WEBSITE_DOC = 'website';
const ABOUT_DOC = 'about';
const CONTACT_DOC = 'contact';

const LOCAL_BRAND_KEY = 'hemareddy_brand_settings_v2';
const LOCAL_WEBSITE_KEY = 'hemareddy_website_settings_v2';
const LOCAL_ABOUT_KEY = 'hemareddy_about_settings_v1';
const LOCAL_CONTACT_KEY = 'hemareddy_contact_settings_v1';

// ================= BRAND SETTINGS =================

export const getBrandSettings = async () => {
  try {
    const serverData = await apiGet('/api/settings/brand');
    if (serverData && serverData.brandName) {
      localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(serverData));
      return { ...initialBrandSettings, ...serverData };
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, BRAND_DOC));
      if (snap.exists()) {
        return { ...initialBrandSettings, ...snap.data() };
      }
    } catch (err) {}
  }

  const saved = localStorage.getItem(LOCAL_BRAND_KEY);
  if (saved) {
    try {
      return { ...initialBrandSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }
  return initialBrandSettings;
};

export const saveBrandSettings = async (settings) => {
  const merged = { ...initialBrandSettings, ...settings };
  
  try {
    await apiPut('/api/settings/brand', merged);
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, BRAND_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {}
  }

  localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(merged));
  return merged;
};

// ================= WEBSITE SETTINGS =================

export const getWebsiteSettings = async () => {
  try {
    const serverData = await apiGet('/api/settings/website');
    if (serverData && serverData.homepage) {
      localStorage.setItem(LOCAL_WEBSITE_KEY, JSON.stringify(serverData));
      return { ...initialWebsiteSettings, ...serverData };
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, WEBSITE_DOC));
      if (snap.exists()) {
        return { ...initialWebsiteSettings, ...snap.data() };
      }
    } catch (err) {}
  }

  const saved = localStorage.getItem(LOCAL_WEBSITE_KEY);
  if (saved) {
    try {
      return { ...initialWebsiteSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }
  return initialWebsiteSettings;
};

export const saveWebsiteSettings = async (settings) => {
  const merged = { ...initialWebsiteSettings, ...settings };

  try {
    await apiPut('/api/settings/website', merged);
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, WEBSITE_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {}
  }

  localStorage.setItem(LOCAL_WEBSITE_KEY, JSON.stringify(merged));
  return merged;
};

// ================= ABOUT SETTINGS =================

export const getAboutSettings = async () => {
  try {
    const serverData = await apiGet('/api/settings/about');
    if (serverData) {
      if (serverData.photoUrl && serverData.photoUrl.includes('unsplash.com/photo-1534528741775')) {
        serverData.photoUrl = '';
      }
      localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(serverData));
      return { ...initialAboutSettings, ...serverData };
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, ABOUT_DOC));
      if (snap.exists()) {
        const data = snap.data();
        if (data.photoUrl && data.photoUrl.includes('unsplash.com/photo-1534528741775')) {
          data.photoUrl = '';
        }
        return { ...initialAboutSettings, ...data };
      }
    } catch (err) {}
  }

  const saved = localStorage.getItem(LOCAL_ABOUT_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.photoUrl && parsed.photoUrl.includes('unsplash.com/photo-1534528741775')) {
        parsed.photoUrl = '';
      }
      return { ...initialAboutSettings, ...parsed };
    } catch (e) {}
  }
  return initialAboutSettings;
};

export const saveAboutSettings = async (settings) => {
  const merged = { ...initialAboutSettings, ...settings };

  try {
    await apiPut('/api/settings/about', merged);
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, ABOUT_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {}
  }

  localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(merged));
  return merged;
};

// ================= CONTACT SETTINGS =================

export const getContactSettings = async () => {
  try {
    const serverData = await apiGet('/api/settings/contact');
    if (serverData) {
      localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(serverData));
      return { ...initialContactSettings, ...serverData };
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, CONTACT_DOC));
      if (snap.exists()) {
        return { ...initialContactSettings, ...snap.data() };
      }
    } catch (err) {}
  }

  const saved = localStorage.getItem(LOCAL_CONTACT_KEY);
  if (saved) {
    try {
      return { ...initialContactSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }
  return initialContactSettings;
};

export const saveContactSettings = async (settings) => {
  const merged = { ...initialContactSettings, ...settings };

  try {
    await apiPut('/api/settings/contact', merged);
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, CONTACT_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {}
  }

  localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(merged));
  return merged;
};

// ================= IMAGE UPLOAD UTILITY =================
export const uploadImage = async (file, pathPrefix = 'uploads') => {
  if (!file) return null;

  // 1. If Firebase Storage is configured, upload to Firebase
  if (isFirebaseConfigured && storage) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${cleanFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('[hemareddy] Firebase Storage upload error, falling back:', err);
    }
  }

  // 2. Read as Base64 Data URL
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  // 3. Send to backend server upload API (Cloudinary / ImgBB / Server Storage)
  try {
    const uploadRes = await apiPost('/api/upload', {
      dataUrl,
      filename: file.name,
      folder: pathPrefix,
    });
    if (uploadRes && uploadRes.url) {
      return uploadRes.url;
    }
  } catch (e) {
    console.error('[Label HemaReddy] Image upload failed on server:', e);
  }

  // 4. Return dataUrl as fallback
  return dataUrl;
};

// ================= CLOUD STORAGE SETTINGS =================
export const getStorageSettings = async () => {
  try {
    const res = await apiGet('/api/settings/storage');
    return res;
  } catch (e) {
    return {
      provider: 'auto',
      activeProvider: 'server',
      cloudinary: { cloudName: '', apiKey: '', hasSecret: false, folder: 'label_hemareddy', isConfigured: false },
      imgbb: { hasApiKey: false, isConfigured: false },
    };
  }
};

export const saveStorageSettings = async (settings) => {
  return await apiPut('/api/settings/storage', settings);
};

export const testStorageSettings = async (payload) => {
  return await apiPost('/api/settings/storage/test', payload);
};

