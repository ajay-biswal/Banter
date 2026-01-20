import { Router } from 'express';
import { register, login, refreshTokens, logout, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', authMiddleware, refreshTokens);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
export default router;
//# sourceMappingURL=auth.routes.js.map