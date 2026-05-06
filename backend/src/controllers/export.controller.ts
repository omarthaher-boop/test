import { Request, Response } from 'express';
import { Trip } from '../models/Trip';
import { User } from '../models/User';
import { exportService } from '../services/export.service';
import { emailService } from '../services/email.service';
import { AppError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

function buildDateFilter(from?: string, to?: string) {
  if (!from && !to) return {};
  return {
    startTime: {
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    },
  };
}

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const trips = await Trip.find({
    userId: req.user.userId,
    isActive: false,
    ...buildDateFilter(from, to),
  }).sort({ startTime: -1 });

  const pdfBuffer = await exportService.generatePdf(user, trips);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="fahrten_${Date.now()}.pdf"`);
  res.send(pdfBuffer);
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const trips = await Trip.find({
    userId: req.user.userId,
    isActive: false,
    ...buildDateFilter(from, to),
  }).sort({ startTime: -1 });

  const csv = exportService.generateCsv(user, trips);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="fahrten_${Date.now()}.csv"`);
  res.send('﻿' + csv); // BOM for correct UTF-8 in Excel
});

export const exportEmail = asyncHandler(async (req: Request, res: Response) => {
  const { format, recipientEmail, from, to } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const trips = await Trip.find({
    userId: req.user.userId,
    isActive: false,
    ...buildDateFilter(from, to),
  }).sort({ startTime: -1 });

  let fileData: Buffer | string;
  if (format === 'pdf') {
    fileData = await exportService.generatePdf(user, trips);
  } else {
    fileData = exportService.generateCsv(user, trips);
  }

  await emailService.sendExport(recipientEmail, format, fileData);
  res.json({ success: true, data: { message: `Export sent to ${recipientEmail}` } });
});
