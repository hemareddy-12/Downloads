import { 
  collection, 
  doc, 
  getDocs, 
  getDocsFromServer,
  getDoc,
  getDocFromServer,
  addDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { initialStitchingServices } from '../utils/initialData';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const STITCHING_COLLECTION = 'stitching_services';
const SETTINGS_COLLECTION = 'settings';
const PORTFOLIO_DOC = 'stitching_portfolio';
const LOCAL_STITCHING_KEY = 'hemareddy_stitching_services_v4';
const LOCAL_STITCHING_GALLERY_KEY = 'hemareddy_stitching_gallery_v3';

const sanitizeService = (service) => {
  if (!service) return null;
  const clean = { ...service };
  if (clean.image && clean.image.includes('unsplash.com')) {
    clean.image = '';
  }
  if (Array.isArray(clean.images)) {
    clean.images = clean.images.filter(img => img && !img.includes('unsplash.com'));
  } else {
    clean.images = clean.image ? [clean.image] : [];
  }
  const displayPrice = clean.startingPrice || clean.price || '';
  clean.price = displayPrice;
  clean.startingPrice = displayPrice;
  return clean;
};

// Merge Firestore docs with initial services so all 5 services always exist
const mergeWithInitialServices = (loadedServices) => {
  const map = new Map();
  // Put initial 5 services first
  initialStitchingServices.forEach(s => map.set(s.id, sanitizeService(s)));
  // Merge loaded/edited services on top (Firestore has higher priority)
  if (Array.isArray(loadedServices)) {
    loadedServices.forEach(s => {
      if (s && s.id) {
        const existing = map.get(s.id) || {};
        map.set(s.id, sanitizeService({ ...existing, ...s }));
      }
    });
  }
  return Array.from(map.values());
};

const getLocalServices = () => {
  const data = localStorage.getItem(LOCAL_STITCHING_KEY);
  if (!data) return initialStitchingServices.map(sanitizeService);
  try {
    const list = JSON.parse(data);
    return mergeWithInitialServices(list);
  } catch (e) {
    return initialStitchingServices.map(sanitizeService);
  }
};

const setLocalServices = (services) => {
  localStorage.setItem(LOCAL_STITCHING_KEY, JSON.stringify(services));
};

export const getStitchingServices = async () => {
  // 1. PRIMARY: Fetch latest data directly from Firebase Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        // Query Firestore server directly, bypassing local client cache
        snap = await getDocsFromServer(collection(db, STITCHING_COLLECTION));
      } catch (e) {
        snap = await getDocs(collection(db, STITCHING_COLLECTION));
      }

      if (snap && !snap.empty) {
        const firestoreList = snap.docs.map(d => sanitizeService({ id: d.id, ...d.data() }));
        const merged = mergeWithInitialServices(firestoreList);
        setLocalServices(merged);
        return merged;
      } else {
        // If Firestore collection is empty, return initial defaults and seed in background
        const defaults = initialStitchingServices.map(sanitizeService);
        setLocalServices(defaults);
        defaults.forEach(async (svc) => {
          try {
            await setDoc(doc(db, STITCHING_COLLECTION, svc.id), svc, { merge: true });
          } catch (e) {}
        });
        return defaults;
      }
    } catch (err) {
      console.warn('[stitchingService] Firestore fetch error, falling back:', err);
    }
  }

  // 2. FALLBACK: Local cache
  const localList = getLocalServices();
  if (localList && localList.length > 0) {
    return localList;
  }

  // 3. LAST RESORT: Express backend API (if Firebase not configured)
  try {
    const serverList = await apiGet('/api/stitching');
    if (Array.isArray(serverList) && serverList.length > 0) {
      const sanitized = mergeWithInitialServices(serverList);
      setLocalServices(sanitized);
      return sanitized;
    }
  } catch (e) {}

  return initialStitchingServices.map(sanitizeService);
};

export const createStitchingService = async (serviceData) => {
  const rawPrice = serviceData.startingPrice || serviceData.price || '';
  const priceNumber = String(rawPrice).replace(/[^0-9]/g, '');
  const finalPrice = priceNumber ? `Starting from ₹${priceNumber}` : rawPrice;

  const payload = {
    title: serviceData.title || '',
    description: serviceData.description || '',
    price: finalPrice,
    startingPrice: finalPrice,
    turnaround: serviceData.turnaround || '',
    image: serviceData.image || '',
    images: serviceData.images || (serviceData.image ? [serviceData.image] : []),
    caption: serviceData.caption || '',
  };

  // 1. PRIMARY: Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, STITCHING_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...payload };
      const services = getLocalServices();
      services.push(created);
      setLocalServices(services);
      apiPost('/api/stitching', payload).catch(() => {});
      return created;
    } catch (err) {
      console.error('[stitchingService] Firestore create error:', err);
    }
  }

  // 2. Local fallback
  const services = getLocalServices();
  const newService = {
    ...payload,
    id: `stitch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  services.push(newService);
  setLocalServices(services);
  apiPost('/api/stitching', payload).catch(() => {});
  return newService;
};

export const updateStitchingService = async (id, serviceData) => {
  const rawPrice = serviceData.startingPrice || serviceData.price || '';
  const priceNumber = String(rawPrice).replace(/[^0-9]/g, '');
  const finalPrice = priceNumber ? `Starting from ₹${priceNumber}` : rawPrice;

  const payload = {
    ...serviceData,
    price: finalPrice,
    startingPrice: finalPrice,
    images: serviceData.images || (serviceData.image ? [serviceData.image] : []),
  };

  console.log('[stitchingService] Updating service ID in Firestore:', id, payload);

  // 1. PRIMARY: Write directly to Firebase Firestore with setDoc merge: true
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, STITCHING_COLLECTION, id), {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('[stitchingService] Firestore update successful for ID:', id);
    } catch (err) {
      console.error('[stitchingService] Firestore update error for ID:', id, err);
      throw new Error(`Failed to save to Firestore: ${err.message}`);
    }
  }

  // 2. Update local storage cache immediately
  const services = getLocalServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx !== -1) {
    services[idx] = { ...services[idx], ...payload, updatedAt: new Date().toISOString() };
    setLocalServices(services);
  } else {
    services.push({ id, ...payload, updatedAt: new Date().toISOString() });
    setLocalServices(services);
  }

  // 3. Non-blocking background sync to Express backend (optional, never blocks UI)
  apiPut(`/api/stitching/${id}`, payload).catch(() => {});

  return { id, ...payload };
};

export const deleteStitchingService = async (id) => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, STITCHING_COLLECTION, id));
    } catch (err) {
      console.error('[stitchingService] Firestore delete error:', err);
    }
  }

  const services = getLocalServices().filter(s => s.id !== id);
  setLocalServices(services);
  apiDelete(`/api/stitching/${id}`).catch(() => {});
  return true;
};

// Work / Portfolio Gallery photos stored in Firestore
export const getStitchingWorkPhotos = async () => {
  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, PORTFOLIO_DOC));
      } catch (e) {
        snap = await getDoc(doc(db, SETTINGS_COLLECTION, PORTFOLIO_DOC));
      }
      if (snap && snap.exists() && Array.isArray(snap.data()?.photos)) {
        const clean = snap.data().photos.filter(p => p && p.url && !p.url.includes('unsplash.com'));
        localStorage.setItem(LOCAL_STITCHING_GALLERY_KEY, JSON.stringify(clean));
        return clean;
      }
    } catch (err) {}
  }

  // 2. Local fallback
  const data = localStorage.getItem(LOCAL_STITCHING_GALLERY_KEY);
  if (data) {
    try {
      const list = JSON.parse(data);
      return list.filter(p => p && p.url && !p.url.includes('unsplash.com'));
    } catch (e) {}
  }

  // 3. Server fallback
  try {
    const list = await apiGet('/api/stitching/photos');
    if (Array.isArray(list)) {
      const clean = list.filter(p => p && p.url && !p.url.includes('unsplash.com'));
      localStorage.setItem(LOCAL_STITCHING_GALLERY_KEY, JSON.stringify(clean));
      return clean;
    }
  } catch (e) {}

  return [];
};

export const saveStitchingWorkPhotos = async (photos) => {
  const clean = photos.filter(p => p && p.url && !p.url.includes('unsplash.com'));

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, PORTFOLIO_DOC), {
        photos: clean,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[stitchingService] Firestore save photos error:', err);
    }
  }

  localStorage.setItem(LOCAL_STITCHING_GALLERY_KEY, JSON.stringify(clean));
  apiPost('/api/stitching/photos', { photos: clean }).catch(() => {});
  return clean;
};
