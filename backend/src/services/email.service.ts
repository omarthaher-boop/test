import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  secure: env.SMTP_PORT === 465,
});

export const emailService = {
  async sendVerification(to: string, token: string): Promise<void> {
    const link = `${env.BACKEND_URL}/api/v1/auth/verify-email/${token}`;
    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: 'E-Mail-Adresse bestätigen – TripTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">TripTracker</h2>
          <p>Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren:</p>
          <a href="${link}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            E-Mail bestätigen
          </a>
          <p style="color: #64748B; font-size: 13px; margin-top: 24px;">
            Der Link ist 24 Stunden gültig. Falls du kein Konto erstellt hast, ignoriere diese E-Mail.
          </p>
        </div>
      `,
    });
  },

  async sendExport(
    to: string,
    format: 'pdf' | 'csv',
    fileBuffer: Buffer | string,
  ): Promise<void> {
    const filename = `fahrten.${format}`;
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: `Deine Fahrtenliste – TripTracker`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #3B82F6;">TripTracker</h2>
          <p>Im Anhang findest du deine exportierten Fahrten als ${format.toUpperCase()}.</p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: fileBuffer,
          contentType: mimeType,
        },
      ],
    });
  },
};
