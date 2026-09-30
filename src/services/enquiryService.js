import { 
  collection, 
  doc, 
  getDocs, 
  getDocsFromServer,
  addDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { apiGet, apiPost } from './apiClient';

const ENQUIRIES_COLLECTION = 'enquiries';
const MESSAGES_COLLECTION = 'messages';
const LOCAL_ENQUIRIES_KEY = 'lhr_enquiries_local';
const LOCAL_MESSAGES_KEY = 'lhr_messages_local';

const getLocal = (key) => {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
};

const setLocal = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ================= CUSTOM STITCHING ENQUIRIES =================

export const submitCustomEnquiry = async (enquiryData) => {
  const newEnquiry = {
    ...enquiryData,
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, ENQUIRIES_COLLECTION), {
        ...newEnquiry,
        serverCreatedAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...newEnquiry };
      const list = getLocal(LOCAL_ENQUIRIES_KEY);
      list.unshift(created);
      setLocal(LOCAL_ENQUIRIES_KEY, list);
      apiPost('/api/enquiries', newEnquiry).catch(() => {});
      return created;
    } catch (err) {}
  }

  // 2. Server API fallback
  try {
    const res = await apiPost('/api/enquiries', newEnquiry);
    if (res && res.id) {
      const list = getLocal(LOCAL_ENQUIRIES_KEY);
      list.unshift(res);
      setLocal(LOCAL_ENQUIRIES_KEY, list);
      return res;
    }
  } catch (e) {}

  // 3. Local fallback
  const list = getLocal(LOCAL_ENQUIRIES_KEY);
  const item = { id: `enq-${Date.now()}`, ...newEnquiry };
  list.unshift(item);
  setLocal(LOCAL_ENQUIRIES_KEY, list);
  return item;
};

export const getCustomEnquiries = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snapshot;
      try {
        snapshot = await getDocsFromServer(collection(db, ENQUIRIES_COLLECTION));
      } catch (e) {
        snapshot = await getDocs(collection(db, ENQUIRIES_COLLECTION));
      }
      if (snapshot) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLocal(LOCAL_ENQUIRIES_KEY, list);
        return list;
      }
    } catch (err) {}
  }

  // 2. Local fallback
  const localList = getLocal(LOCAL_ENQUIRIES_KEY);
  if (localList && localList.length > 0) return localList;

  // 3. Server fallback
  try {
    const serverList = await apiGet('/api/enquiries');
    if (Array.isArray(serverList)) {
      setLocal(LOCAL_ENQUIRIES_KEY, serverList);
      return serverList;
    }
  } catch (e) {}

  return [];
};

export const updateEnquiryStatus = async (id, status) => {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, ENQUIRIES_COLLECTION, id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {}
  }
  const list = getLocal(LOCAL_ENQUIRIES_KEY);
  const idx = list.findIndex(e => e.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    setLocal(LOCAL_ENQUIRIES_KEY, list);
    return list[idx];
  }
  return { id, status };
};

// ================= CONTACT MESSAGES =================

export const submitContactMessage = async (msgData) => {
  const newMsg = {
    ...msgData,
    read: false,
    createdAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...newMsg,
        serverCreatedAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...newMsg };
      const list = getLocal(LOCAL_MESSAGES_KEY);
      list.unshift(created);
      setLocal(LOCAL_MESSAGES_KEY, list);
      apiPost('/api/messages', newMsg).catch(() => {});
      return created;
    } catch (err) {}
  }

  // 2. Server API
  try {
    const res = await apiPost('/api/messages', newMsg);
    if (res && res.id) {
      const list = getLocal(LOCAL_MESSAGES_KEY);
      list.unshift(res);
      setLocal(LOCAL_MESSAGES_KEY, list);
      return res;
    }
  } catch (e) {}

  // 3. Local fallback
  const list = getLocal(LOCAL_MESSAGES_KEY);
  const item = { id: `msg-${Date.now()}`, ...newMsg };
  list.unshift(item);
  setLocal(LOCAL_MESSAGES_KEY, list);
  return item;
};

export const getContactMessages = async () => {
  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      let snapshot;
      try {
        snapshot = await getDocsFromServer(collection(db, MESSAGES_COLLECTION));
      } catch (e) {
        snapshot = await getDocs(collection(db, MESSAGES_COLLECTION));
      }
      if (snapshot) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLocal(LOCAL_MESSAGES_KEY, list);
        return list;
      }
    } catch (err) {}
  }

  // 2. Local fallback
  const localList = getLocal(LOCAL_MESSAGES_KEY);
  if (localList && localList.length > 0) return localList;

  // 3. Server fallback
  try {
    const serverList = await apiGet('/api/messages');
    if (Array.isArray(serverList)) {
      setLocal(LOCAL_MESSAGES_KEY, serverList);
      return serverList;
    }
  } catch (e) {}

  return [];
};
