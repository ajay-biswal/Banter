import axios from 'axios';
import { env } from '@/config/env';

// Utility function to get cookie by name
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

// Prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Add CSRF token to requests that require it
    const csrfToken = getCookie('csrf_token');
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      config.headers = {
        ...config.headers,
        'X-CSRF-Token': csrfToken
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is the refresh request itself failing, don't retry
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh endpoint itself returned 401 - logout user
        if (typeof window !== 'undefined') {
          // Clear any client-side auth state
          localStorage.removeItem('auth');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await http.post('/auth/refresh');
        
        if ((response.data as any)?.accessToken) {
          // Process queued requests
          processQueue(null, (response.data as any).accessToken);
          
          // Retry the original request with new token
          return http(originalRequest);
        }
      } catch (refreshError: any) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        
        if (typeof window !== 'undefined') {
          // Clear any client-side auth state
          localStorage.removeItem('auth');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth service functions
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await http.post('/auth/login', credentials);
    return response.data as AuthResponse;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await http.post('/auth/register', data);
    return response.data as AuthResponse;
  },

  fetchMe: async (): Promise<{ user: any }> => {
    const response = await http.get('/auth/me');
    return response.data as { user: any };
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await http.post('/auth/logout');
    return response.data as AuthResponse;
  }
};