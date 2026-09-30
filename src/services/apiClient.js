// Centralized API client for hemareddy
// Sends authenticated requests to backend server with fallback to local storage

const ADMIN_TOKEN_KEY = 'hemareddy_admin_token';

export const getAdminToken = () => {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token) => {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const removeAdminToken = () => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // If server returned 401 Unauthorized on admin endpoint
      if (endpoint.startsWith('/api/admin') || options.method !== 'GET') {
        removeAdminToken();
      }
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const apiGet = (endpoint) => apiFetch(endpoint, { 
  method: 'GET',
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});
export const apiPost = (endpoint, data) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const apiPut = (endpoint, data) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (endpoint) => apiFetch(endpoint, { method: 'DELETE' });
