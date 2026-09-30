import { 
  doc, 
  getDoc, 
  getDocFromServer,
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

const LOCAL_BRAND_KEY = 'hemareddy_brand_settings_v3';
const LOCAL_WEBSITE_KEY = 'hemareddy_website_settings_v3';
const LOCAL_ABOUT_KEY = 'hemareddy_about_settings_v2';
const LOCAL_CONTACT_KEY = 'hemareddy_contact_settings_v2';

// ================= BRAND SETTINGS =================

export const getBrandSettings = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, BRAND_DOC));
      } catch (e) {
        snap = await getDoc(doc(db, SETTINGS_COLLECTION, BRAND_DOC));
      }
      if (snap && snap.exists()) {
        const merged = { ...initialBrandSettings, ...snap.data() };
        localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[settingsService] Firestore getBrandSettings error:', err);
    }
  }

  // 2. Local fallback
  const saved = localStorage.getItem(LOCAL_BRAND_KEY);
  if (saved) {
    try {
      return { ...initialBrandSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 3. Server fallback
  try {
    const serverData = await apiGet('/api/settings/brand');
    if (serverData && serverData.brandName) {
      localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(serverData));
      return { ...initialBrandSettings, ...serverData };
    }
  } catch (e) {}

  return initialBrandSettings;
};

export const saveBrandSettings = async (settings) => {
  const merged = { ...initialBrandSettings, ...settings };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, BRAND_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[settingsService] Firestore saveBrandSettings error:', err);
      throw err;
    }
  }

  localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(merged));
  apiPut('/api/settings/brand', merged).catch(() => {});
  return merged;
};

// ================= WEBSITE SETTINGS =================

export const getWebsiteSettings = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, WEBSITE_DOC));
      } catch (e) {
        snap = await getDoc(doc(db, SETTINGS_COLLECTION, WEBSITE_DOC));
      }
      if (snap && snap.exists()) {
        const merged = { ...initialWebsiteSettings, ...snap.data() };
        localStorage.setItem(LOCAL_WEBSITE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[settingsService] Firestore getWebsiteSettings error:', err);
    }
  }

  // 2. Local fallback
  const saved = localStorage.getItem(LOCAL_WEBSITE_KEY);
  if (saved) {
    try {
      return { ...initialWebsiteSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 3. Server fallback
  try {
    const serverData = await apiGet('/api/settings/website');
    if (serverData && serverData.homepage) {
      localStorage.setItem(LOCAL_WEBSITE_KEY, JSON.stringify(serverData));
      return { ...initialWebsiteSettings, ...serverData };
    }
  } catch (e) {}

  return initialWebsiteSettings;
};

export const saveWebsiteSettings = async (settings) => {
  const merged = { ...initialWebsiteSettings, ...settings };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, WEBSITE_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[settingsService] Firestore saveWebsiteSettings error:', err);
      throw err;
    }
  }

  localStorage.setItem(LOCAL_WEBSITE_KEY, JSON.stringify(merged));
  apiPut('/api/settings/website', merged).catch(() => {});
  return merged;
};

// ================= ABOUT SETTINGS =================

export const getAboutSettings = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, ABOUT_DOC));
      } catch (e) {
        snap = await getDoc(doc(db, SETTINGS_COLLECTION, ABOUT_DOC));
      }
      if (snap && snap.exists()) {
        const merged = { ...initialAboutSettings, ...snap.data() };
        localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[settingsService] Firestore getAboutSettings error:', err);
    }
  }

  // 2. Local fallback
  const saved = localStorage.getItem(LOCAL_ABOUT_KEY);
  if (saved) {
    try {
      return { ...initialAboutSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 3. Server fallback
  try {
    const serverData = await apiGet('/api/settings/about');
    if (serverData && serverData.heading) {
      localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(serverData));
      return { ...initialAboutSettings, ...serverData };
    }
  } catch (e) {}

  return initialAboutSettings;
};

export const saveAboutSettings = async (settings) => {
  const merged = { ...initialAboutSettings, ...settings };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, ABOUT_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[settingsService] Firestore saveAboutSettings error:', err);
      throw err;
    }
  }

  localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(merged));
  apiPut('/api/settings/about', merged).catch(() => {});
  return merged;
};

// ================= CONTACT SETTINGS =================

export const getContactSettings = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, CONTACT_DOC));
      } catch (e) {
        snap = await getDoc(doc(db, SETTINGS_COLLECTION, CONTACT_DOC));
      }
      if (snap && snap.exists()) {
        const merged = { ...initialContactSettings, ...snap.data() };
        localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[settingsService] Firestore getContactSettings error:', err);
    }
  }

  // 2. Local fallback
  const saved = localStorage.getItem(LOCAL_CONTACT_KEY);
  if (saved) {
    try {
      return { ...initialContactSettings, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 3. Server fallback
  try {
    const serverData = await apiGet('/api/settings/contact');
    if (serverData && serverData.phone) {
      localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(serverData));
      return { ...initialContactSettings, ...serverData };
    }
  } catch (e) {}

  return initialContactSettings;
};

export const saveContactSettings = async (settings) => {
  const merged = { ...initialContactSettings, ...settings };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, CONTACT_DOC), {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[settingsService] Firestore saveContactSettings error:', err);
      throw err;
    }
  }

  localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(merged));
  apiPut('/api/settings/contact', merged).catch(() => {});
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
