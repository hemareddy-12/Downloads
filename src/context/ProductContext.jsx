import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories } from '../services/productService';
import { initialProducts, initialCategories } from '../utils/initialData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(cats)) setCategories(cats);
    } catch (err) {
      console.error('[Label HemaReddy] Error loading catalog data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const refreshProducts = async () => {
    const prods = await getProducts();
    if (prods) setProducts(prods);
  };

  const refreshCategories = async () => {
    const cats = await getCategories();
    if (cats) setCategories(cats);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        refreshProducts,
        refreshCategories,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
