import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
/**
 * GET /api/users
 * Get all users except the current user
 */
router.get('/', authMiddleware, getAllUsers);
export default router;
//# sourceMappingURL=user.routes.js.map