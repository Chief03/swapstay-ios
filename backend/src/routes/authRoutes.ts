import { Router } from 'express';
import { register, login, verifyEmail, resendVerificationEmail } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

export default router;