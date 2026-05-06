import apiClient from './client';
import { ApiResponse, AuthTokens, User } from '../types';

export interface RegisterPayload {
  name: string;
  birthDate: string;
  licensePlate: string;
  email: string;
  password: string;
  gdprConsentedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken }),

  verifyEmail: (token: string) =>
    apiClient.get<ApiResponse<{ message: string }>>(`/auth/verify-email/${token}`),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email }),
};
