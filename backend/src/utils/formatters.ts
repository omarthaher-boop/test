import { TripPurpose } from '../models/Trip';

export function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatKm(km: number | null): string {
  if (km === null || km === undefined) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} Min.`;
  return `${h} Std. ${m} Min.`;
}

export const purposeLabel: Record<TripPurpose, string> = {
  private: 'Privat',
  business: 'Geschäftlich',
  commute: 'Arbeitsweg',
};
