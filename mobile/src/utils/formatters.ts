import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { TripPurpose } from '../types';

export const formatKm = (km: number | null): string => {
  if (km === null || km === undefined) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatDuration = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
};

export const formatTime = (dateString: string | null): string => {
  if (!dateString) return '—';
  return format(new Date(dateString), 'HH:mm', { locale: de });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Heute';
  if (isYesterday(date)) return 'Gestern';
  return format(date, 'dd. MMM yyyy', { locale: de });
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
};

export const formatRelative = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
};

export const formatBirthDate = (dateString: string): string => {
  return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
};

export const purposeLabel: Record<TripPurpose, string> = {
  private: 'Privat',
  business: 'Geschäftlich',
  commute: 'Arbeitsweg',
};

export const purposeEmoji: Record<TripPurpose, string> = {
  private: '🏠',
  business: '💼',
  commute: '🏢',
};

export const formatAddress = (address?: string | null, lat?: number, lon?: number): string => {
  if (address) return address;
  if (lat !== undefined && lon !== undefined) {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
  return 'Unbekannt';
};
