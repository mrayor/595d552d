import mongoose from 'mongoose';
import { NoteModel } from '@models/note.model';
import noteService from '@services/note.service';

describe('Note Service', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockNoteData = {
        title: 'Test Note',
        content: 'Test Content',
        tags: ['test', 'unit']
    };

    beforeEach(async () => {
        await NoteModel.deleteMany({});
    });

    describe('createNote', () => {
        it('should create a note successfully', async () => {
            const note = await noteService.createNote({ userId: mockUserId.toString(), ...mockNoteData });

            expect(note).toBeDefined();
            expect(note.title).toBe(mockNoteData.title);
            expect(note.content).toBe(mockNoteData.content);
            expect(note.tags).toEqual(mockNoteData.tags);
            expect(note.owner.toString()).toBe(mockUserId.toString());
        });
    });

    describe('getNotes', () => {
        beforeEach(async () => {
            // Create test notes
            await NoteModel.create([
                { ...mockNoteData, owner: mockUserId },
                { ...mockNoteData, title: 'Second Note', owner: mockUserId },
                { title: 'Shared Note', content: 'Shared Content', owner: new mongoose.Types.ObjectId(), sharedWith: [mockUserId] }
            ]);
        });

        it('should get all notes for user (owned and shared)', async () => {
            const notes = await noteService.getNotes({ userId: mockUserId.toString(), start: 0, limit: 10 });

            expect(notes).toHaveLength(3);
        });

        it('should get notes with pagination', async () => {
            const notes = await noteService.getNotes({ userId: mockUserId.toString(), start: 0, limit: 2 });

            expect(notes).toHaveLength(2);
        });

        it('should get notes with search query', async () => {
            const notes = await noteService.getNotes({
                userId: mockUserId.toString(),
                start: 0,
                limit: 10,
                searchQuery: 'Second'
            });

            expect(notes).toHaveLength(1);
            expect(notes[0].title).toBe('Second Note');
        });
    });

    describe('getTotalNotes', () => {
        beforeEach(async () => {
            await NoteModel.create([
                { ...mockNoteData, owner: mockUserId },
                { ...mockNoteData, title: 'Second Note', owner: mockUserId },
                { title: 'Shared Note', content: 'Shared Content', owner: new mongoose.Types.ObjectId(), sharedWith: [mockUserId] }
            ]);
        });

        it('should get total count of notes for user', async () => {
            const total = await noteService.getTotalNotes(mockUserId.toString());
            expect(total).toBe(3);
        });

        it('should get total count of notes with search query', async () => {
            const total = await noteService.getTotalNotes(mockUserId.toString(), 'Second');
            expect(total).toBe(1);
        });
    });

    describe('updateNote', () => {
        let noteId: string;

        beforeEach(async () => {
            const note = await NoteModel.create({ ...mockNoteData, owner: mockUserId });
            noteId = note._id.toString();
        });

        it('should update note successfully', async () => {
            const updatedData = {
                title: 'Updated Title',
                content: 'Updated Content'
            };

            const note = await noteService.updateNote({ id: noteId, ...updatedData });

            expect(note?.title).toBe(updatedData.title);
            expect(note?.content).toBe(updatedData.content);
        });
    });

    describe('deleteNote', () => {
        let noteId: string;

        beforeEach(async () => {
            const note = await NoteModel.create({ ...mockNoteData, owner: mockUserId });
            noteId = note._id.toString();
        });

        it('should delete note successfully', async () => {
            await noteService.deleteNote(noteId);
            const note = await NoteModel.findById(noteId);
            expect(note).toBeNull();
        });
    });
}); 