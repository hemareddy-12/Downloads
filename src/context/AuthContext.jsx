import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { getAdminToken, setAdminToken, removeAdminToken, apiGet, apiPost } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify backend admin session on load
  useEffect(() => {
    const verifySession = async () => {
      // 1. Verify backend token first
      const token = getAdminToken();
      if (token) {
        try {
          const res = await apiGet('/api/admin/verify');
          if (res && res.authenticated) {
            setIsAdmin(true);
            setCurrentUser(res.user);
            setLoading(false);
            return;
          }
        } catch (e) {
          removeAdminToken();
        }
      }

      // 2. If Firebase is configured, check Firebase Auth
      if (isFirebaseConfigured && auth) {
        try {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'labelhemareddy@gmail.com').toLowerCase();
              const userIsAdmin = user.email?.toLowerCase() === adminEmail || user.email?.toLowerCase().includes('admin');
              setIsAdmin(userIsAdmin);
              setCurrentUser(user);
            } else if (!token) {
              setIsAdmin(false);
              setCurrentUser(null);
            }
            setLoading(false);
          });
          return unsubscribe;
        } catch (err) {
          console.warn('[AuthContext] Firebase Auth listener error:', err);
        }
      }

      setIsAdmin(false);
      setCurrentUser(null);
      setLoading(false);
    };

    verifySession();
  }, []);

  const adminLogin = async (email, password) => {
    // 1. If Firebase Auth is configured, attempt Firebase Auth sign-in
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'labelhemareddy@gmail.com').toLowerCase();
        const userIsAdmin = cred.user.email?.toLowerCase() === adminEmail || cred.user.email?.toLowerCase().includes('admin');
        setIsAdmin(userIsAdmin);
        setCurrentUser(cred.user);
        return { success: true, user: cred.user };
      } catch (firebaseErr) {
        console.warn('[AuthContext] Firebase Auth sign-in failed, trying backend admin credentials:', firebaseErr.code || firebaseErr.message);
        // Fall through to backend server verification!
      }
    }

    // 2. Authenticate securely with backend server API (permanent hashed admin credentials)
    try {
      const data = await apiPost('/api/admin/login', { email, password });
      if (data && data.success && data.token) {
        setAdminToken(data.token);
        setIsAdmin(true);
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      removeAdminToken();
      setIsAdmin(false);
      throw new Error(err.message || 'Invalid admin credentials');
    }
  };

  const adminSetup = async (email, password, name) => {
    try {
      const data = await apiPost('/api/admin/setup', {
        email: email ? email.trim().toLowerCase() : 'labelhemareddy@gmail.com',
        password: password ? password.trim() : '',
        name,
      });
      if (data && data.success && data.token) {
        setAdminToken(data.token);
        setIsAdmin(true);
        setCurrentUser(data.user);
        return { success: true, user: data.user, message: data.message };
      } else {
        throw new Error(data?.error || 'Failed to save permanent password');
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to save permanent password');
    }
  };

  const logout = async () => {
    try {
      await apiPost('/api/admin/logout', {}).catch(() => {});
    } catch (e) {}

    if (isFirebaseConfigured && auth) {
      await signOut(auth).catch(() => {});
    }

    removeAdminToken();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        adminLogin,
        adminSetup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
