// lib/fetch-client.js
const baseFetch = async (url, options = {}) => {
  // Get token on each request (avoids stale token issues)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Auto-logout on 401
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
      throw new Error('Unauthorized');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Specific HTTP method helpers
export const fetchClient = {
  get: (url) => baseFetch(url, { method: 'GET' }),

  post: (url, data) => baseFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  patch: (url, data) => baseFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  put: (url, data) => baseFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (url) => baseFetch(url, { method: 'DELETE' }),
};