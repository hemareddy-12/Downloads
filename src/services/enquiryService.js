import { 
  collection, 
  doc, 
  getDocs, 
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

  try {
    const res = await apiPost('/api/enquiries', newEnquiry);
    if (res && res.id) {
      const list = getLocal(LOCAL_ENQUIRIES_KEY);
      list.unshift(res);
      setLocal(LOCAL_ENQUIRIES_KEY, list);
      return res;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, ENQUIRIES_COLLECTION), {
        ...newEnquiry,
        serverCreatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...newEnquiry };
    } catch (err) {}
  }

  const list = getLocal(LOCAL_ENQUIRIES_KEY);
  const item = { id: `enq-${Date.now()}`, ...newEnquiry };
  list.unshift(item);
  setLocal(LOCAL_ENQUIRIES_KEY, list);
  return item;
};

export const getCustomEnquiries = async () => {
  try {
    const serverList = await apiGet('/api/enquiries');
    if (Array.isArray(serverList)) {
      setLocal(LOCAL_ENQUIRIES_KEY, serverList);
      return serverList;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, ENQUIRIES_COLLECTION));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {}
  }
  return getLocal(LOCAL_ENQUIRIES_KEY);
};

export const updateEnquiryStatus = async (id, status) => {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, ENQUIRIES_COLLECTION, id), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { id, status };
    } catch (err) {}
  }
  const list = getLocal(LOCAL_ENQUIRIES_KEY);
  const idx = list.findIndex(e => e.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    setLocal(LOCAL_ENQUIRIES_KEY, list);
    return list[idx];
  }
  throw new Error('Enquiry not found');
};

// ================= CONTACT MESSAGES =================

export const submitContactMessage = async (msgData) => {
  const newMsg = {
    ...msgData,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiPost('/api/messages', newMsg);
    if (res && res.id) {
      const list = getLocal(LOCAL_MESSAGES_KEY);
      list.unshift(res);
      setLocal(LOCAL_MESSAGES_KEY, list);
      return res;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...newMsg,
        serverCreatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...newMsg };
    } catch (err) {}
  }

  const list = getLocal(LOCAL_MESSAGES_KEY);
  const item = { id: `msg-${Date.now()}`, ...newMsg };
  list.unshift(item);
  setLocal(LOCAL_MESSAGES_KEY, list);
  return item;
};

export const getContactMessages = async () => {
  try {
    const serverList = await apiGet('/api/messages');
    if (Array.isArray(serverList)) {
      setLocal(LOCAL_MESSAGES_KEY, serverList);
      return serverList;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, MESSAGES_COLLECTION));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {}
  }
  return getLocal(LOCAL_MESSAGES_KEY);
};
