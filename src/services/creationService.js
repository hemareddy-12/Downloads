import { 
  collection, 
  doc, 
  getDocs, 
  getDocsFromServer,
  addDoc, 
  setDoc,
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const CREATIONS_COLLECTION = 'creations';
const LOCAL_CREATIONS_KEY = 'hemareddy_creations_v2';

const getLocalCreations = () => {
  const data = localStorage.getItem(LOCAL_CREATIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const setLocalCreations = (creations) => {
  localStorage.setItem(LOCAL_CREATIONS_KEY, JSON.stringify(creations));
};

export const getCreations = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocsFromServer(collection(db, CREATIONS_COLLECTION));
      } catch (e) {
        snap = await getDocs(collection(db, CREATIONS_COLLECTION));
      }
      if (snap) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setLocalCreations(items);
        return items;
      }
    } catch (err) {
      console.warn('[creationService] Firestore getCreations error:', err);
    }
  }

  // 2. Local fallback
  const items = getLocalCreations();
  if (items && items.length > 0) {
    items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    return items;
  }

  // 3. Server fallback
  try {
    const list = await apiGet('/api/creations');
    if (Array.isArray(list)) {
      setLocalCreations(list);
      return list;
    }
  } catch (e) {}

  return [];
};

export const createCreation = async (creationData) => {
  const payload = {
    title: creationData.title || '',
    description: creationData.description || '',
    category: creationData.category || 'Custom Outfit',
    caption: creationData.caption || '',
    images: creationData.images || [],
    primaryImage: creationData.primaryImage || (creationData.images && creationData.images[0]) || '',
    order: creationData.order ?? Date.now(),
    featured: creationData.featured ?? false,
    createdAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, CREATIONS_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...payload };
      const list = getLocalCreations();
      list.push(created);
      setLocalCreations(list);
      apiPost('/api/creations', payload).catch(() => {});
      return created;
    } catch (err) {
      console.error('[creationService] Firestore create error:', err);
    }
  }

  // 2. Local fallback
  const creations = getLocalCreations();
  const newCreation = {
    id: `creation-${Date.now()}`,
    ...payload,
  };
  creations.push(newCreation);
  setLocalCreations(creations);
  apiPost('/api/creations', payload).catch(() => {});
  return newCreation;
};

export const updateCreation = async (id, creationData) => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, CREATIONS_COLLECTION, id), {
        ...creationData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[creationService] Firestore update error:', err);
    }
  }

  const creations = getLocalCreations();
  const idx = creations.findIndex(c => c.id === id);
  if (idx !== -1) {
    creations[idx] = { ...creations[idx], ...creationData };
    setLocalCreations(creations);
  }
  apiPut(`/api/creations/${id}`, creationData).catch(() => {});
  return { id, ...creationData };
};

export const deleteCreation = async (id) => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, CREATIONS_COLLECTION, id));
    } catch (err) {
      console.error('[creationService] Firestore delete error:', err);
    }
  }

  const creations = getLocalCreations().filter(c => c.id !== id);
  setLocalCreations(creations);
  apiDelete(`/api/creations/${id}`).catch(() => {});
  return true;
};

export const reorderCreations = async (orderedCreations) => {
  setLocalCreations(orderedCreations);
  if (isFirebaseConfigured && db) {
    try {
      const batchPromises = orderedCreations.map((item, index) => 
        setDoc(doc(db, CREATIONS_COLLECTION, item.id), { order: index }, { merge: true })
      );
      await Promise.all(batchPromises);
    } catch (err) {
      console.error('[creationService] Firestore reorder error:', err);
    }
  }
  apiPost('/api/creations/reorder', {
    orderMap: orderedCreations.map((c, idx) => ({ id: c.id, order: idx })),
  }).catch(() => {});
  return orderedCreations;
};
