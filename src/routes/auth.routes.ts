import { Router } from 'express';
import authController from '@controllers/auth.controller';
import constants from '@utils/constants';
import { validate } from '@middlewares/validate.middleware';
import userSchema from '@schemas/user.schema';
import authSchema from '@schemas/auth.schema';
const { ROUTES } = constants;

const router = Router();

router.post(ROUTES.auth.signup, validate(userSchema.register), authController.signup);
router.post(ROUTES.auth.login, validate(authSchema.login), authController.login);
router.post(ROUTES.auth.logout, authController.logout);
router.post(ROUTES.auth.refreshToken, authController.refreshAccessToken);

export default router;