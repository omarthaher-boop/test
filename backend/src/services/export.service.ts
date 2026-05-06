import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { ITrip } from '../models/Trip';
import { IUser } from '../models/User';
import { formatDate, formatKm, formatDuration, purposeLabel } from '../utils/formatters';

export const exportService = {
  async generatePdf(user: IUser, trips: ITrip[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).fillColor('#3B82F6').text('TripTracker', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#0F172A').text('Fahrtenbuch', { align: 'center' });
      doc.moveDown(0.5);

      // User info
      doc.fontSize(10).fillColor('#64748B')
        .text(`Name: ${user.name}   |   Kennzeichen: ${user.licensePlate}   |   Erstellt: ${formatDate(new Date())}`,
          { align: 'center' });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').stroke();
      doc.moveDown(0.5);

      // Table header
      const COL = [50, 130, 220, 310, 365, 420, 470];
      const headers = ['Datum', 'Start', 'Ziel', 'Gefahren', 'Kürzeste', 'Dauer', 'Zweck'];
      doc.fontSize(8).fillColor('#64748B');
      headers.forEach((h, i) => doc.text(h, COL[i], doc.y, { width: COL[i + 1] ? COL[i + 1] - COL[i] - 4 : 80 }));

      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').stroke();
      doc.moveDown(0.3);

      // Rows
      trips.forEach((trip, idx) => {
        if (doc.y > 750) doc.addPage();
        const y = doc.y;
        doc.fontSize(8).fillColor(idx % 2 === 0 ? '#0F172A' : '#334155');

        const start = trip.startLocation?.address ?? `${trip.startLocation?.latitude?.toFixed(3)},${trip.startLocation?.longitude?.toFixed(3)}`;
        const end = trip.endLocation?.address ?? `${trip.endLocation?.latitude?.toFixed(3)},${trip.endLocation?.longitude?.toFixed(3)}`;

        const row = [
          formatDate(trip.startTime),
          truncate(start, 18),
          truncate(end, 18),
          formatKm(trip.distanceKm),
          trip.shortestRouteKm !== null ? formatKm(trip.shortestRouteKm) : '—',
          formatDuration(trip.durationMinutes),
          purposeLabel[trip.purpose],
        ];

        row.forEach((cell, i) => {
          doc.text(cell, COL[i], y, { width: COL[i + 1] ? COL[i + 1] - COL[i] - 4 : 80 });
        });
        doc.moveDown(0.5);
      });

      // Summary
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').stroke();
      doc.moveDown(0.5);
      const totalKm = trips.reduce((s, t) => s + (t.distanceKm ?? 0), 0);
      doc.fontSize(9).fillColor('#3B82F6')
        .text(`Gesamt: ${trips.length} Fahrten  |  ${formatKm(totalKm)}  |  TripTracker v1.0`, { align: 'right' });

      doc.end();
    });
  },

  generateCsv(user: IUser, trips: ITrip[]): string {
    const rows = trips.map((trip) => ({
      Name: user.name,
      Kennzeichen: user.licensePlate,
      Datum: formatDate(trip.startTime),
      Startzeit: trip.startTime.toISOString(),
      Endzeit: trip.endTime?.toISOString() ?? '',
      Startort: trip.startLocation?.address ?? `${trip.startLocation?.latitude},${trip.startLocation?.longitude}`,
      Zielort: trip.endLocation?.address ?? `${trip.endLocation?.latitude},${trip.endLocation?.longitude}`,
      'Gefahrene Kilometer': trip.distanceKm?.toFixed(2) ?? '',
      'Kürzeste Route (km)': trip.shortestRouteKm?.toFixed(2) ?? '',
      'Dauer (Min.)': trip.durationMinutes?.toFixed(0) ?? '',
      Fahrtzweck: purposeLabel[trip.purpose],
      Notiz: trip.note ?? '',
    }));

    return stringify(rows, { header: true, delimiter: ';' });
  },
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
