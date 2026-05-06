import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  birthDate: Date;
  licensePlate: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerifyToken: string | null;
  emailVerifyExpires: Date | null;
  refreshTokens: string[]; // stored as bcrypt hashes for multi-device support
  gdprConsentedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    licensePlate: { type: String, required: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null, select: false },
    emailVerifyExpires: { type: Date, default: null, select: false },
    refreshTokens: { type: [String], default: [], select: false },
    gdprConsentedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Cascade delete trips on user removal
userSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    const { Trip } = await import('./Trip');
    await Trip.deleteMany({ userId: doc._id });
  }
  next();
});

export const User = model<IUser>('User', userSchema);
