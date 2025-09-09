import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
      return;
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    if (!user.emailVerified) {
      res.status(403).json({ 
        success: false, 
        message: 'Email not verified' 
      });
      return;
    }
    
    req.user = user;
    next();
    
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token',
      error: error.message 
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      next();
      return;
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.emailVerified) {
      req.user = user;
    }
    
    next();
    
  } catch (error) {
    next();
  }
};