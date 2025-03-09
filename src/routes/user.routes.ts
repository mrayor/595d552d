import { Router } from 'express';
import constants from '@utils/constants';
import userController from '@controllers/user.controller';
import { authGuard } from '@middlewares/authGuard.middleware';

const { ROUTES } = constants;

const router = Router();

router.get(ROUTES.user.authenticated, authGuard, userController.authenticatedUser);

export default router;