import { Request, Response } from 'express';
import { User } from '../models/User';
import { Trip } from '../models/Trip';
import { AppError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, licensePlate } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { ...(name && { name }), ...(licensePlate && { licensePlate: licensePlate.toUpperCase() }) },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  // Cascade delete via mongoose pre-hook
  await User.findOneAndDelete({ _id: req.user.userId });
  res.json({ success: true, data: null });
});
