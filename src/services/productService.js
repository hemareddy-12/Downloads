import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { initialCategories } from '../utils/initialData';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const LOCAL_PRODUCTS_KEY = 'hemareddy_products_v2';
const LOCAL_CATEGORIES_KEY = 'hemareddy_categories_v2';

const getLocalProducts = () => {
  const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const setLocalProducts = (products) => {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

export const getProducts = async () => {
  // 1. Try backend server API
  try {
    const serverProds = await apiGet('/api/products');
    if (Array.isArray(serverProds)) {
      setLocalProducts(serverProds);
      return serverProds;
    }
  } catch (e) {}

  // 2. Try Firebase if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {}
  }

  // 3. Fallback to local cache
  return getLocalProducts();
};

export const getProductById = async (id) => {
  try {
    const prod = await apiGet(`/api/products/${id}`);
    if (prod) return prod;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
    } catch (err) {}
  }
  const products = getLocalProducts();
  return products.find(p => p.id === id) || null;
};

export const createProduct = async (productData) => {
  // 1. Try backend server (Admin protected)
  try {
    const serverResult = await apiPost('/api/products', productData);
    if (serverResult && serverResult.id) {
      const list = getLocalProducts();
      list.push(serverResult);
      setLocalProducts(list);
      return serverResult;
    }
  } catch (e) {}

  // 2. Try Firebase
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...productData };
    } catch (err) {}
  }

  // 3. Local fallback
  const products = getLocalProducts();
  const newProduct = {
    ...productData,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  setLocalProducts(products);
  return newProduct;
};

export const updateProduct = async (id, productData) => {
  try {
    const serverResult = await apiPut(`/api/products/${id}`, productData);
    if (serverResult) {
      const products = getLocalProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...productData };
        setLocalProducts(products);
      }
      return serverResult;
    }
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, { ...productData, updatedAt: serverTimestamp() });
      return { id, ...productData };
    } catch (err) {}
  }

  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...productData, updatedAt: new Date().toISOString() };
    setLocalProducts(products);
    return products[idx];
  }
  throw new Error('Product not found');
};

export const deleteProduct = async (id) => {
  try {
    await apiDelete(`/api/products/${id}`);
    const products = getLocalProducts().filter(p => p.id !== id);
    setLocalProducts(products);
    return true;
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (err) {}
  }

  const products = getLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  setLocalProducts(filtered);
  return true;
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  const data = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(initialCategories));
    return initialCategories;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialCategories;
  }
};

export const createCategory = async (categoryData) => {
  const categories = await getCategories();
  const newCat = {
    ...categoryData,
    id: categoryData.slug || `cat-${Date.now()}`,
  };
  categories.push(newCat);
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  return newCat;
};

export const updateCategory = async (id, categoryData) => {
  const categories = await getCategories();
  const idx = categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], ...categoryData };
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    return categories[idx];
  }
  throw new Error('Category not found');
};

export const deleteCategory = async (id) => {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
  return true;
};
