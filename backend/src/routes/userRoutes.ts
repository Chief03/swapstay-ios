import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication (but allow unverified users)
router.get('/me', authenticateUser, getCurrentUser);
router.put('/me', authenticateUser, updateCurrentUser);

export default router;