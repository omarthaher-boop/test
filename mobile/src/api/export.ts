import apiClient from './client';
import { ApiResponse } from '../types';

export interface ExportParams {
  from?: string;
  to?: string;
}

export interface EmailExportPayload extends ExportParams {
  format: 'pdf' | 'csv';
  recipientEmail: string;
}

export const exportApi = {
  downloadPdf: (params?: ExportParams) =>
    apiClient.get('/export/pdf', { params, responseType: 'arraybuffer' }),

  downloadCsv: (params?: ExportParams) =>
    apiClient.get('/export/csv', { params, responseType: 'arraybuffer' }),

  sendByEmail: (payload: EmailExportPayload) =>
    apiClient.post<ApiResponse<{ message: string }>>('/export/email', payload),
};
