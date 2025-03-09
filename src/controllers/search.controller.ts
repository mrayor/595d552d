import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '@configs/winston.config';
import { paginate, response } from '@utils/helpers';
import noteService from '@services/note.service';

/**
 * Search Notes.
 * @route GET /search?q=
 */
const searchNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, page, perPage } = req.query as Record<string, string | undefined>;
        const { user: u } = res.locals;

        if (!q) {
            return response({
                code: StatusCodes.BAD_REQUEST,
                message: 'Search query is required',
                res,
                success: false,
            });
        }

        const total = await noteService.getTotalNotes(u.sub, q);

        const { limit, main: meta, start } = paginate({ limit: perPage, page, total });

        const notes = await noteService.getNotes({ userId: u.sub, start, limit, searchQuery: q });

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

export default {
    searchNotes,
};
