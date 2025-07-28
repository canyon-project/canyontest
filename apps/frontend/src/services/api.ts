import axios from 'axios';

const API_BASE_URL = '/api/v1';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  settings: {
    language: string;
    theme: string;
    theme_color: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateSettingsRequest {
  language?: string;
  theme?: string;
  theme_color?: string;
}

// 认证相关API
export const authAPI = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data),
  getProfile: () => api.get<User>('/profile'),
  updateSettings: (data: UpdateSettingsRequest) => api.put<User>('/settings', data),
};

// 用户相关API
export const userAPI = {
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  createUser: (data: any) => api.post<User>('/users', data),
};

export default api;