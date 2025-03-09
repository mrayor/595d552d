import { array, object, string, TypeOf } from 'zod';

const createNote = object({
    body: object({
        title: string({ required_error: 'Title is required' }).trim().nonempty(),
        content: string({ required_error: 'Content is required' }).trim().nonempty(),
        tags: array(string()).optional(),
    }).strict(),
});

const updateNote = object({
    body: object({
        title: string({ required_error: 'Title is required' }).trim().nonempty().optional(),
        content: string({ required_error: 'Content is required' }).trim().nonempty().optional(),
        tags: array(string()).optional(),
    }).strict(),
});

const shareNote = object({
    body: object({
        emails: array(string({ required_error: 'Email is required' }).email().trim()),
    }).strict(),
});

export type CreateNoteInput = TypeOf<typeof createNote>['body'];
export type UpdateNoteInput = TypeOf<typeof updateNote>['body'];
export type ShareNoteInput = TypeOf<typeof shareNote>['body'];


const noteSchema = {
    createNote,
    updateNote,
    shareNote,
};

export default noteSchema;
