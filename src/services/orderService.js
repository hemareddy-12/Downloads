import { 
  collection, 
  doc, 
  getDocs, 
  getDocsFromServer,
  getDoc,
  getDocFromServer,
  addDoc, 
  setDoc,
  updateDoc, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { generateOrderId } from '../utils/formatters';
import { apiGet, apiPost, apiPut } from './apiClient';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = 'lhr_orders_local';

const getLocalOrders = () => {
  const data = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const setLocalOrders = (orders) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

export const createOrder = async (orderData) => {
  const finalOrderId = orderData.orderId || generateOrderId();
  const newOrder = {
    ...orderData,
    orderId: finalOrderId,
    orderStatus: orderData.orderStatus || 'Pending',
    paymentStatus: orderData.paymentStatus || 'Pending',
    createdAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firebase
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...newOrder,
        serverCreatedAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...newOrder };
      const orders = getLocalOrders();
      orders.unshift(created);
      setLocalOrders(orders);
      apiPost('/api/orders', newOrder).catch(() => {});
      return created;
    } catch (err) {}
  }

  // 2. Server API
  try {
    const res = await apiPost('/api/orders', newOrder);
    if (res && res.orderId) {
      const orders = getLocalOrders();
      orders.unshift(res);
      setLocalOrders(orders);
      return res;
    }
  } catch (e) {}

  // 3. Fallback to local
  const orders = getLocalOrders();
  const orderWithLocalId = { id: `ord-${Date.now()}`, ...newOrder };
  orders.unshift(orderWithLocalId);
  setLocalOrders(orders);
  return orderWithLocalId;
};

export const getOrders = async () => {
  // 1. PRIMARY: Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snapshot;
      try {
        snapshot = await getDocsFromServer(query(collection(db, ORDERS_COLLECTION)));
      } catch (e) {
        snapshot = await getDocs(query(collection(db, ORDERS_COLLECTION)));
      }
      if (snapshot) {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLocalOrders(orders);
        return orders;
      }
    } catch (err) {}
  }

  // 2. Local fallback
  const local = getLocalOrders();
  if (local && local.length > 0) return local;

  // 3. Server fallback
  try {
    const serverOrders = await apiGet('/api/orders');
    if (Array.isArray(serverOrders)) {
      setLocalOrders(serverOrders);
      return serverOrders;
    }
  } catch (e) {}

  return [];
};

export const getOrderByIdOrCode = async (idOrCode) => {
  const orders = await getOrders();
  const found = orders.find(o => 
    o.id?.toLowerCase() === idOrCode?.toLowerCase() || 
    o.orderId?.toLowerCase() === idOrCode?.toLowerCase()
  );
  if (found) return found;

  // Try tracking endpoint on server
  try {
    const order = await apiGet(`/api/orders/track/${encodeURIComponent(idOrCode)}`);
    if (order) return order;
  } catch (e) {}

  return null;
};

export const updateOrderStatus = async (orderId, statusData) => {
  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...statusData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {}
  }

  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === orderId || o.orderId === orderId);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...statusData };
    setLocalOrders(orders);
  }

  apiPut(`/api/orders/${orderId}/status`, statusData).catch(() => {});
  return { success: true };
};
