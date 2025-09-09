import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken, generateEmailVerificationToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, university, universityDomain } = req.body;
    
    if (!email.endsWith('.edu')) {
      res.status(400).json({ 
        success: false, 
        message: 'Email must be a valid .edu address' 
      });
      return;
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
      return;
    }
    
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      university,
      universityDomain: universityDomain.toLowerCase(),
      emailVerificationToken,
      emailVerificationExpires
    });
    
    const token = generateToken(user);
    
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      university: user.university,
      universityDomain: user.universityDomain,
      emailVerified: user.emailVerified,
      profilePicture: user.profilePicture,
      bio: user.bio,
      yearInSchool: user.yearInSchool,
      major: user.major
    };
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token,
      user: userResponse
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering user',
      error: error.message 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
      return;
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }
    
    if (!user.emailVerified) {
      res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
      return;
    }
    
    const token = generateToken(user);
    
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      university: user.university,
      universityDomain: user.universityDomain,
      emailVerified: user.emailVerified,
      profilePicture: user.profilePicture,
      bio: user.bio,
      yearInSchool: user.yearInSchool,
      major: user.major
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in',
      error: error.message 
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');
    
    if (!user) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
      return;
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying email',
      error: error.message 
    });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    if (user.emailVerified) {
      res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
      return;
    }
    
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resending verification email',
      error: error.message 
    });
  }
};