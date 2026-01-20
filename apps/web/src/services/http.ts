import axios from 'axios';
import { env } from '@/config/env';

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
  (error) => {
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