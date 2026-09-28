import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const CREATIONS_COLLECTION = 'creations';
const LOCAL_CREATIONS_KEY = 'hemareddy_creations_v1';

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
  // 1. Try server API
  try {
    const list = await apiGet('/api/creations');
    if (Array.isArray(list)) {
      setLocalCreations(list);
      return list;
    }
  } catch (e) {}

  // 2. Try Firestore
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, CREATIONS_COLLECTION));
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        return items;
      }
    } catch (err) {}
  }

  // 3. Fallback to local
  const items = getLocalCreations();
  items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  return items;
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

  // 1. Try server API
  try {
    const result = await apiPost('/api/creations', payload);
    if (result && result.id) {
      const list = getLocalCreations();
      list.push(result);
      setLocalCreations(list);
      return result;
    }
  } catch (e) {}

  // 2. Try Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, CREATIONS_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...payload };
    } catch (err) {}
  }

  // 3. Local fallback
  const creations = getLocalCreations();
  const newCreation = {
    id: `creation-${Date.now()}`,
    ...payload,
  };
  creations.push(newCreation);
  setLocalCreations(creations);
  return newCreation;
};

export const updateCreation = async (id, creationData) => {
  try {
    const result = await apiPut(`/api/creations/${id}`, creationData);
    if (result) {
      const list = getLocalCreations();
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...creationData };
        setLocalCreations(list);
      }
      return result;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, CREATIONS_COLLECTION, id), {
        ...creationData,
        updatedAt: serverTimestamp(),
      });
      return { id, ...creationData };
    } catch (err) {}
  }

  const creations = getLocalCreations();
  const idx = creations.findIndex(c => c.id === id);
  if (idx !== -1) {
    creations[idx] = { 
      ...creations[idx], 
      ...creationData, 
      updatedAt: new Date().toISOString() 
    };
    setLocalCreations(creations);
    return creations[idx];
  }
  throw new Error('Creation not found');
};

export const deleteCreation = async (id) => {
  try {
    await apiDelete(`/api/creations/${id}`);
    const list = getLocalCreations().filter(c => c.id !== id);
    setLocalCreations(list);
    return true;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, CREATIONS_COLLECTION, id));
    } catch (err) {}
  }

  const creations = getLocalCreations();
  const filtered = creations.filter(c => c.id !== id);
  setLocalCreations(filtered);
  return true;
};

export const reorderCreations = async (orderedList) => {
  const updated = orderedList.map((item, index) => ({
    ...item,
    order: index,
  }));
  setLocalCreations(updated);

  try {
    await apiPost('/api/creations/reorder', { orderedList: updated });
    return updated;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await Promise.all(
        updated.map(item => 
          updateDoc(doc(db, CREATIONS_COLLECTION, item.id), { order: item.order })
        )
      );
    } catch (err) {}
  }
  return updated;
};
