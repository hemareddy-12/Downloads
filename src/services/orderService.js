import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
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

  // 1. Try server API
  try {
    const res = await apiPost('/api/orders', newOrder);
    if (res && res.orderId) {
      const orders = getLocalOrders();
      orders.unshift(res);
      setLocalOrders(orders);
      return res;
    }
  } catch (e) {}

  // 2. Try Firebase
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...newOrder,
        serverCreatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...newOrder };
    } catch (err) {}
  }

  // 3. Fallback to local
  const orders = getLocalOrders();
  const orderWithLocalId = { id: `ord-${Date.now()}`, ...newOrder };
  orders.unshift(orderWithLocalId);
  setLocalOrders(orders);
  return orderWithLocalId;
};

export const getOrders = async () => {
  try {
    const serverOrders = await apiGet('/api/orders');
    if (Array.isArray(serverOrders)) {
      setLocalOrders(serverOrders);
      return serverOrders;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, ORDERS_COLLECTION));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {}
  }
  return getLocalOrders();
};

export const getOrderByIdOrCode = async (idOrCode) => {
  // Try tracking endpoint on server
  try {
    const order = await apiGet(`/api/orders/track/${encodeURIComponent(idOrCode)}`);
    if (order) return order;
  } catch (e) {}

  const orders = await getOrders();
  return orders.find(o => 
    o.id?.toLowerCase() === idOrCode?.toLowerCase() || 
    o.orderId?.toLowerCase() === idOrCode?.toLowerCase()
  ) || null;
};

export const updateOrderStatus = async (id, statusData) => {
  try {
    const updated = await apiPut(`/api/orders/${id}/status`, statusData);
    if (updated) return updated;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...statusData,
        updatedAt: serverTimestamp(),
      });
      return { id, ...statusData };
    } catch (err) {}
  }

  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === id || o.orderId === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...statusData, updatedAt: new Date().toISOString() };
    setLocalOrders(orders);
    return orders[idx];
  }
  throw new Error('Order not found');
};
