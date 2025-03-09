import { NoteModel } from '@models/note.model';
import { CreateNoteInput, UpdateNoteInput } from '@schemas/note.schema';
import { PaginationPayload } from 'src/types';

const getTotalNotes = async (userId: string, searchQuery?: string) => {
    const query = { $or: [{ owner: userId }, { sharedWith: userId }] };

    if (!searchQuery) {
        return NoteModel.countDocuments(query).exec();
    }

    return NoteModel.countDocuments({ $and: [query, { $text: { $search: searchQuery } }] }).exec();
};

const getNotes = async ({ userId, start, limit, searchQuery }: { userId: string, searchQuery?: string } & PaginationPayload) => {
    const query = { $or: [{ owner: userId }, { sharedWith: userId }] };

    if (!searchQuery) {
        return NoteModel.find(query).skip(start).limit(limit).sort({ updatedAt: -1 }).exec();
    }

    return NoteModel.find({ $and: [query, { $text: { $search: searchQuery } }] }).skip(start).limit(limit).sort({ score: { $meta: 'textScore' } }).exec();
};

const getNoteById = async (id: string) => {
    return NoteModel.findById(id).exec();
};

const createNote = async ({ userId, ...body }: { userId: string } & CreateNoteInput) => {
    return NoteModel.create({ ...body, owner: userId });
};

const updateNote = async ({ id, ...body }: { id: string } & UpdateNoteInput) => {
    return NoteModel.findByIdAndUpdate(id, body, { new: true }).exec();
};

const deleteNote = async (id: string) => {
    return NoteModel.findByIdAndDelete(id).exec();
};

export default {
    getTotalNotes,
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
};
