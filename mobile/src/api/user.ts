import apiClient from './client';
import { ApiResponse, User } from '../types';

export interface UpdateUserPayload {
  name?: string;
  licensePlate?: string;
}

export const userApi = {
  getMe: () => apiClient.get<ApiResponse<User>>('/user/me'),

  updateMe: (payload: UpdateUserPayload) =>
    apiClient.patch<ApiResponse<User>>('/user/me', payload),

  deleteMe: () => apiClient.delete<ApiResponse<null>>('/user/me'),
};
