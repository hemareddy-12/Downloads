import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { initialStitchingServices } from '../utils/initialData';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const STITCHING_COLLECTION = 'stitching_services';
const LOCAL_STITCHING_KEY = 'hemareddy_stitching_services_v3';
const LOCAL_STITCHING_GALLERY_KEY = 'hemareddy_stitching_gallery_v2';

const sanitizeService = (service) => {
  const clean = { ...service };
  if (clean.image && clean.image.includes('unsplash.com')) {
    clean.image = '';
  }
  if (Array.isArray(clean.images)) {
    clean.images = clean.images.filter(img => img && !img.includes('unsplash.com'));
  } else {
    clean.images = clean.image ? [clean.image] : [];
  }
  return clean;
};

const getLocalServices = () => {
  const data = localStorage.getItem(LOCAL_STITCHING_KEY);
  if (!data) return initialStitchingServices.map(sanitizeService);
  try {
    const list = JSON.parse(data);
    return list.map(sanitizeService);
  } catch (e) {
    return initialStitchingServices.map(sanitizeService);
  }
};

const setLocalServices = (services) => {
  localStorage.setItem(LOCAL_STITCHING_KEY, JSON.stringify(services));
};

export const getStitchingServices = async () => {
  try {
    const serverList = await apiGet('/api/stitching');
    if (Array.isArray(serverList)) {
      const sanitized = serverList.map(sanitizeService);
      setLocalServices(sanitized);
      return sanitized;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, STITCHING_COLLECTION));
      if (!snap.empty) {
        return snap.docs.map(d => sanitizeService({ id: d.id, ...d.data() }));
      }
    } catch (err) {}
  }
  return getLocalServices();
};

export const createStitchingService = async (serviceData) => {
  const payload = {
    title: serviceData.title || '',
    description: serviceData.description || '',
    price: serviceData.price || '',
    turnaround: serviceData.turnaround || '',
    image: serviceData.image || '',
    images: serviceData.images || (serviceData.image ? [serviceData.image] : []),
    caption: serviceData.caption || '',
  };

  try {
    const result = await apiPost('/api/stitching', payload);
    if (result && result.id) {
      const services = getLocalServices();
      services.push(result);
      setLocalServices(services);
      return result;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, STITCHING_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...payload };
    } catch (err) {}
  }

  const services = getLocalServices();
  const newService = {
    ...payload,
    id: `stitch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  services.push(newService);
  setLocalServices(services);
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

  console.log('updateStitchingService updating ID:', id, payload);

  // 1. Firebase update with setDoc merge: true
  if (isFirebaseConfigured && db) {
    try {
      console.log('Firebase setDoc with merge:true for stitching ID:', id);
      await setDoc(doc(db, STITCHING_COLLECTION, id), {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('Firebase stitching update successful for ID:', id);
    } catch (err) {
      console.error('Firebase stitching update error for id:', id, err);
    }
  }

  // 2. Express Backend API update
  try {
    const result = await apiPut(`/api/stitching/${id}`, payload);
    if (result) {
      const services = getLocalServices();
      const idx = services.findIndex(s => s.id === id);
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...payload };
        setLocalServices(services);
      }
      return result;
    }
  } catch (e) {
    console.error('Backend API stitching update error for id:', id, e);
  }

  // 3. Local storage update
  const services = getLocalServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx !== -1) {
    services[idx] = { ...services[idx], ...payload, updatedAt: new Date().toISOString() };
    setLocalServices(services);
    return services[idx];
  } else {
    const fallback = { id, ...payload, updatedAt: new Date().toISOString() };
    services.push(fallback);
    setLocalServices(services);
    return fallback;
  }
};

export const deleteStitchingService = async (id) => {
  try {
    await apiDelete(`/api/stitching/${id}`);
    const services = getLocalServices().filter(s => s.id !== id);
    setLocalServices(services);
    return true;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, STITCHING_COLLECTION, id));
      return true;
    } catch (err) {}
  }
  const services = getLocalServices();
  const filtered = services.filter(s => s.id !== id);
  setLocalServices(filtered);
  return true;
};

// Work / Portfolio Gallery photos
export const getStitchingWorkPhotos = async () => {
  try {
    const list = await apiGet('/api/stitching/photos');
    if (Array.isArray(list)) {
      const clean = list.filter(p => p && p.url && !p.url.includes('unsplash.com'));
      localStorage.setItem(LOCAL_STITCHING_GALLERY_KEY, JSON.stringify(clean));
      return clean;
    }
  } catch (e) {}

  const data = localStorage.getItem(LOCAL_STITCHING_GALLERY_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    return list.filter(p => p && p.url && !p.url.includes('unsplash.com'));
  } catch (e) {
    return [];
  }
};

export const saveStitchingWorkPhotos = async (photos) => {
  const clean = photos.filter(p => p && p.url && !p.url.includes('unsplash.com'));
  try {
    await apiPost('/api/stitching/photos', { photos: clean });
  } catch (e) {}
  localStorage.setItem(LOCAL_STITCHING_GALLERY_KEY, JSON.stringify(clean));
  return clean;
};
