import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is already populated by authenticateUser middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, bio, yearInSchool, major, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { 
        fullName,
        bio,
        yearInSchool,
        major,
        profilePicture,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};