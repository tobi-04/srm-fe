import apiClient from './client';

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'sale' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
  device_id?: string;
  device_name?: string;
  device_type?: string;
  device_token?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  // Note: refreshToken is stored in httpOnly cookie by the backend
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: UserInfo }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (device_id?: string) => {
    const response = await apiClient.post('/auth/logout', device_id ? { device_id } : {});
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  refreshToken: async () => {
    // Refresh token is sent via httpOnly cookie
    const response = await apiClient.post('/auth/refresh', {});
    return response.data;
  },
};
