import home from '@controllers/home.controller';
import { Router } from 'express';
import constants from '@utils/constants';
import auth from './auth.routes';
import user from './user.routes';
import note from './note.routes';
import { authGuard } from '@middlewares/authGuard.middleware';
import search from './search.routes';

const { ROUTES } = constants;

const router: Router = Router();

router.get(ROUTES.home, home.index);
router.use('/auth', auth);
router.use('/user', user);
router.use('/notes', authGuard, note);
router.use('/search', authGuard, search);

export default router;
