import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id?.toString() || user.id,
    email: user.email
  };
  
  const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  return jwt.verify(token, secret) as TokenPayload;
};

export const generateEmailVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateResetPasswordToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};