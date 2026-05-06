import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { authService } from '../services/auth.service';
import { emailService } from '../services/email.service';
import { AppError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, birthDate, licensePlate, email, password, gdprConsentedAt } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const { raw, hash } = authService.generateEmailToken();

  const user = await User.create({
    name,
    birthDate: new Date(birthDate),
    licensePlate,
    email,
    passwordHash: password, // pre-save hook hashes this
    emailVerifyToken: hash,
    emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    gdprConsentedAt: new Date(gdprConsentedAt),
  });

  await emailService.sendVerification(email, raw);

  res.status(201).json({
    success: true,
    data: { message: 'Registration successful. Please verify your email.' },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  if (!user.emailVerified) throw new AppError('Email not verified', 403);

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = authService.signAccessToken(payload);
  const refreshToken = authService.signRefreshToken(payload);

  user.refreshTokens.push(authService.hashRefreshToken(refreshToken));
  // Keep max 5 devices
  if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        birthDate: user.birthDate,
        licensePlate: user.licensePlate,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens: { accessToken, refreshToken },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = authService.verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(payload.userId).select('+refreshTokens');
  if (!user) throw new AppError('User not found', 401);

  const hash = authService.hashRefreshToken(refreshToken);
  const idx = user.refreshTokens.indexOf(hash);
  if (idx === -1) throw new AppError('Refresh token revoked', 401);

  // Rotate refresh token
  const newAccess = authService.signAccessToken({ userId: user._id.toString(), email: user.email });
  const newRefresh = authService.signRefreshToken({ userId: user._id.toString(), email: user.email });

  user.refreshTokens[idx] = authService.hashRefreshToken(newRefresh);
  await user.save();

  res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ email: req.user.email }).select('+refreshTokens');
  if (user) {
    const hash = authService.hashRefreshToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== hash);
    await user.save();
  }
  res.json({ success: true, data: null });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerifyToken: hash,
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (!user) throw new AppError('Invalid or expired verification token', 400);

  user.emailVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpires = null;
  await user.save();

  res.json({ success: true, data: { message: 'Email verified successfully.' } });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+emailVerifyToken +emailVerifyExpires');
  if (!user) {
    // Don't reveal whether the email exists
    res.json({ success: true, data: { message: 'If the email exists, a verification link was sent.' } });
    return;
  }
  if (user.emailVerified) throw new AppError('Email already verified', 400);

  const { raw, hash } = authService.generateEmailToken();
  user.emailVerifyToken = hash;
  user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await emailService.sendVerification(email, raw);
  res.json({ success: true, data: { message: 'Verification email sent.' } });
});
