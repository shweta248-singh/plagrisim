import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  timeout: 30000, // 30s default timeout
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem("proofnexa_auth");
  let token = null;

  if (authData && authData !== "null" && authData !== "undefined") {
    try {
      const parsed = JSON.parse(authData);
      token = parsed?.accessToken || parsed?.token || null;
    } catch (error) {
      console.error("Invalid auth JSON:", error);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Clearing session...");
      localStorage.removeItem('proofnexa_auth');
      localStorage.removeItem('proofnexa_user');
      window.location.href = '/auth?mode=login';
    }
    return Promise.reject(error);
  }
);

// User Profile APIs
export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await api.put('/users/me', payload);
  return response.data;
};

export const updateMyPassword = async (payload) => {
  const response = await api.put('/users/me/password', payload);
  return response.data;
};

export default api;
