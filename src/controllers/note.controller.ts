import { Logger } from '@configs/winston.config';
import { CreateNoteInput, ShareNoteInput, UpdateNoteInput } from '@schemas/note.schema';
import noteService from '@services/note.service';
import { paginate, response } from '@utils/helpers';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

/**
 * Get Notes.
 * @route GET /notes
 */
const getNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, perPage } = req.query as Record<string, string | undefined>;
        const { user: u } = res.locals;

        const total = await noteService.getTotalNotes(u.sub);

        const { limit, main: meta, start } = paginate({ limit: perPage, page, total });

        const notes = await noteService.getNotes({ userId: u.sub, start, limit });

        return response({
            code: StatusCodes.OK,
            data: notes,
            message: 'Notes fetched successfully',
            meta,
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to get notes', err);

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


/**
 * Get Note By Id.
 * @route GET /notes/:id
 */
const getNoteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { user: u } = res.locals;

        const note = await noteService.getNoteById(id);

        if (!note) {
            return response({
                code: StatusCodes.NOT_FOUND,
                message: 'Note not found',
                res,
                success: false,
            });
        }

        if (!note.hasReadAccess(Types.ObjectId.createFromHexString(u.sub))) {
            return response({
                code: StatusCodes.FORBIDDEN,
                message: 'You do not have access to this note',
                res,
                success: false,
            });
        }

        return response({
            code: StatusCodes.OK,
            data: note,
            message: 'Note fetched successfully',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to get note by id', err);

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


/**
 * Create Note.
 * @route POST /notes
 */
const createNote = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateNoteInput>,
    res: Response): Promise<void> => {
    try {
        const { body } = req;
        const { user: u } = res.locals;

        const note = await noteService.createNote({ userId: u.sub, ...body });

        return response({
            code: StatusCodes.OK,
            data: note,
            message: 'Note created successfully',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to create note', err);

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


/**
 * Update Note.
 * @route PATCH /notes/:id
 */
const updateNote = async (req: Request<Record<string, unknown>, Record<string, unknown>, UpdateNoteInput>,
    res: Response): Promise<void> => {
    try {
        const { id } = req.params as Record<string, string>;
        const { body } = req;
        const { user: u } = res.locals;

        const note = await noteService.getNoteById(id);

        if (!note) {
            return response({
                code: StatusCodes.NOT_FOUND,
                message: 'Note not found',
                res,
                success: false,
            });
        }

        if (!note.hasWriteAccess(Types.ObjectId.createFromHexString(u.sub))) {
            return response({
                code: StatusCodes.FORBIDDEN,
                message: 'You do not have access to update this note',
                res,
                success: false,
            });
        }

        const updatedNote = await noteService.updateNote({ id, ...body });

        return response({
            code: StatusCodes.OK,
            data: updatedNote,
            message: 'Note updated successfully',
            res,
            success: true
        });

    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to update note', err);
        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


/**
 * Delete Note.
 * @route DELETE /notes/:id
 */
const deleteNote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as Record<string, string>;
        const { user: u } = res.locals;

        const note = await noteService.getNoteById(id);

        if (!note) {
            return response({
                code: StatusCodes.NOT_FOUND,
                message: 'Note not found',
                res,
                success: false,
            });
        }

        if (!note.hasWriteAccess(Types.ObjectId.createFromHexString(u.sub))) {
            return response({
                code: StatusCodes.FORBIDDEN,
                message: 'You do not have access to delete this note',
                res,
                success: false,
            });
        }

        await noteService.deleteNote(id);

        return response({
            code: StatusCodes.OK,
            message: 'Note deleted successfully',
            res,
            success: true
        });

    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to delete note', err);
        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


/**
 * Share Note.
 * @route POST /notes/:id/share
 */
const shareNote = async (req: Request<Record<string, unknown>, Record<string, unknown>, ShareNoteInput>,
    res: Response): Promise<void> => {
    try {
        const { id } = req.params as Record<string, string>;
        const { body } = req;
        const { user: u } = res.locals;

        const note = await noteService.getNoteById(id);

        if (!note) {
            return response({
                code: StatusCodes.NOT_FOUND,
                message: 'Note not found',
                res,
                success: false,
            });
        }

        const { success, error } = await note.shareNote(Types.ObjectId.createFromHexString(u.sub), body.emails);

        if (!success) {
            return response({
                code: StatusCodes.BAD_REQUEST,
                message: error || 'Unable to share note',
                res,
                success: false,
            });
        }

        return response({
            code: StatusCodes.OK,
            message: 'Note shared successfully',
            res,
            success: true,
        });

    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to share note', err);
        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};

export default {
    createNote,
    deleteNote,
    getNoteById,
    getNotes,
    shareNote,
    updateNote,
};
