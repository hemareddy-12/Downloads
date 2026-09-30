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
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { initialCategories } from '../utils/initialData';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const LOCAL_PRODUCTS_KEY = 'hemareddy_products_v3';
const LOCAL_CATEGORIES_KEY = 'hemareddy_categories_v3';

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
  // 1. PRIMARY: Fetch latest products from Firebase Firestore with NO CACHE
  if (isFirebaseConfigured && db) {
    try {
      let snapshot;
      try {
        snapshot = await getDocsFromServer(query(collection(db, PRODUCTS_COLLECTION)));
      } catch (e) {
        snapshot = await getDocs(query(collection(db, PRODUCTS_COLLECTION)));
      }
      if (snapshot) {
        const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocalProducts(prods);
        return prods;
      }
    } catch (err) {
      console.warn('[productService] Firestore getProducts warning:', err);
    }
  }

  // 2. FALLBACK: Local cache
  const local = getLocalProducts();
  if (local && local.length > 0) {
    return local;
  }

  // 3. LAST RESORT: Server API (only if Firebase is not configured)
  try {
    const serverProds = await apiGet('/api/products');
    if (Array.isArray(serverProds)) {
      setLocalProducts(serverProds);
      return serverProds;
    }
  } catch (e) {}

  return [];
};

export const getProductById = async (id) => {
  // 1. PRIMARY: Firestore with no cache
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      let snapshot;
      try {
        snapshot = await getDocFromServer(docRef);
      } catch (e) {
        snapshot = await getDoc(docRef);
      }
      if (snapshot && snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
    } catch (err) {
      console.warn('[productService] Firestore getProductById error:', err);
    }
  }

  // 2. Local fallback
  const products = getLocalProducts();
  const found = products.find(p => p.id === id);
  if (found) return found;

  // 3. Server fallback
  try {
    const prod = await apiGet(`/api/products/${id}`);
    if (prod) return prod;
  } catch (e) {}

  return null;
};

export const createProduct = async (productData) => {
  const payload = {
    ...productData,
    price: Number(productData.price) || 0,
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
    stock: Number(productData.stock) || 1,
    inStock: Number(productData.stock) > 0,
    createdAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const created = { id: docRef.id, ...payload };
      const products = getLocalProducts();
      products.push(created);
      setLocalProducts(products);
      apiPost('/api/products', payload).catch(() => {});
      return created;
    } catch (err) {
      console.error('[productService] Firestore createProduct error:', err);
      throw new Error(`Failed to save product to Firestore: ${err.message}`);
    }
  }

  // 2. Local fallback
  const products = getLocalProducts();
  const newProduct = {
    ...payload,
    id: `prod-${Date.now()}`,
  };
  products.push(newProduct);
  setLocalProducts(products);
  apiPost('/api/products', payload).catch(() => {});
  return newProduct;
};

export const updateProduct = async (id, productData) => {
  const payload = {
    ...productData,
    price: Number(productData.price) || 0,
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
    stock: Number(productData.stock) || 0,
    inStock: Number(productData.stock) > 0,
    updatedAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await setDoc(docRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
      console.log('[productService] Firestore product updated successfully:', id);
    } catch (err) {
      console.error('[productService] Firestore updateProduct error:', err);
      throw new Error(`Failed to update product in Firestore: ${err.message}`);
    }
  }

  // 2. Local cache update
  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...payload };
    setLocalProducts(products);
  }

  apiPut(`/api/products/${id}`, payload).catch(() => {});
  return { id, ...payload };
};

export const deleteProduct = async (id) => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      console.log('[productService] Firestore product deleted successfully:', id);
    } catch (err) {
      console.error('[productService] Firestore deleteProduct error:', err);
    }
  }

  const products = getLocalProducts().filter(p => p.id !== id);
  setLocalProducts(products);
  apiDelete(`/api/products/${id}`).catch(() => {});
  return true;
};

// ==================== CATEGORIES (Stored in Firestore) ====================
export const getCategories = async () => {
  // 1. PRIMARY: Firestore
  if (isFirebaseConfigured && db) {
    try {
      let snap;
      try {
        snap = await getDocsFromServer(collection(db, CATEGORIES_COLLECTION));
      } catch (e) {
        snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
      }
      if (snap && !snap.empty) {
        const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
        return cats;
      } else {
        // Seed default categories into Firestore
        initialCategories.forEach(async (c) => {
          try {
            await setDoc(doc(db, CATEGORIES_COLLECTION, c.id), c, { merge: true });
          } catch (e) {}
        });
        localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(initialCategories));
        return initialCategories;
      }
    } catch (err) {
      console.warn('[productService] Firestore getCategories error:', err);
    }
  }

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
  const newCat = {
    ...categoryData,
    id: categoryData.slug || `cat-${Date.now()}`,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, CATEGORIES_COLLECTION, newCat.id), newCat, { merge: true });
    } catch (err) {
      console.error('[productService] Firestore createCategory error:', err);
    }
  }

  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== newCat.id);
  filtered.push(newCat);
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
  return newCat;
};

export const updateCategory = async (id, categoryData) => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, CATEGORIES_COLLECTION, id), categoryData, { merge: true });
    } catch (err) {
      console.error('[productService] Firestore updateCategory error:', err);
    }
  }

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
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
    } catch (err) {
      console.error('[productService] Firestore deleteCategory error:', err);
    }
  }

  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
  return true;
};
