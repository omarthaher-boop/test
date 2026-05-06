import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { exportApi, ExportParams } from '../api/export';

export const exportService = {
  async downloadAndShare(format: 'pdf' | 'csv', params?: ExportParams): Promise<void> {
    const response = format === 'pdf'
      ? await exportApi.downloadPdf(params)
      : await exportApi.downloadCsv(params);

    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    const ext = format;
    const filename = `fahrten_${Date.now()}.${ext}`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Convert arraybuffer to base64
    const buffer = response.data as ArrayBuffer;
    const base64 = arrayBufferToBase64(buffer);

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, { mimeType, dialogTitle: `Fahrten als ${format.toUpperCase()} teilen` });
    }
  },

  async sendByEmail(
    format: 'pdf' | 'csv',
    recipientEmail: string,
    params?: ExportParams,
  ): Promise<void> {
    await exportApi.sendByEmail({ format, recipientEmail, ...params });
  },

  async composeEmailWithAttachment(format: 'pdf' | 'csv', params?: ExportParams): Promise<void> {
    const response = format === 'pdf'
      ? await exportApi.downloadPdf(params)
      : await exportApi.downloadCsv(params);

    const ext = format;
    const filename = `fahrten_${Date.now()}.${ext}`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    const buffer = response.data as ArrayBuffer;
    const base64 = arrayBufferToBase64(buffer);

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      // Fallback to share sheet
      await Sharing.shareAsync(fileUri);
      return;
    }

    await MailComposer.composeAsync({
      subject: 'Meine Fahrtenliste',
      body: 'Im Anhang findest du deine exportierten Fahrten.',
      attachments: [fileUri],
    });
  },
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
