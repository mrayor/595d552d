import { Router } from 'express';
import noteController from '@controllers/note.controller';
import constants from '@utils/constants';
import { validate } from '@middlewares/validate.middleware';
import noteSchema from '@schemas/note.schema';

const { ROUTES } = constants;

const router = Router();


router.get(ROUTES.notes.index, noteController.getNotes);
router.get(ROUTES.notes.single, noteController.getNoteById);
router.post(ROUTES.notes.index, validate(noteSchema.createNote), noteController.createNote);
router.patch(ROUTES.notes.single, validate(noteSchema.updateNote), noteController.updateNote);
router.delete(ROUTES.notes.single, noteController.deleteNote);
router.post(ROUTES.notes.share, validate(noteSchema.shareNote), noteController.shareNote);

export default router;