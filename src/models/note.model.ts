import { prop, getModelForClass, Ref, index, DocumentType, Severity, modelOptions } from '@typegoose/typegoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.model';

const MAX_SHARE_BATCH_SIZE = 10;

@modelOptions({ options: { allowMixed: Severity.ALLOW }, schemaOptions: { timestamps: true } })
@index({ title: 'text', content: 'text', tags: 'text' })
export class Note {
    @prop({ required: true, trim: true })
    title: string;

    @prop({ required: true })
    content: string;

    @prop({ ref: () => User, required: true })
    owner: Ref<User>;

    @prop({ ref: () => User, default: [] })
    sharedWith: Ref<User>[];

    @prop({
        type: () => [String],
        trim: true,
        default: [],
        set: (tags: string[]) => [...new Set(tags.map(tag => tag.trim().toLowerCase()))]
    })
    tags: string[];

    hasReadAccess(userId: mongoose.Types.ObjectId): boolean {
        const ownerId = (this.owner instanceof mongoose.Types.ObjectId ? this.owner : (this.owner as Document & { _id: mongoose.Types.ObjectId })._id);
        return (
            userId.equals(ownerId) ||
            this.sharedWith.some((sharedId) => {
                const sharedUserId = (sharedId instanceof mongoose.Types.ObjectId ? sharedId : (sharedId as Document & { _id: mongoose.Types.ObjectId })._id);
                return userId.equals(sharedUserId);
            })
        );
    }

    hasWriteAccess(userId: mongoose.Types.ObjectId): boolean {
        const ownerId = (this.owner instanceof mongoose.Types.ObjectId ? this.owner : (this.owner as Document & { _id: mongoose.Types.ObjectId })._id);
        return ownerId.equals(userId);
    }

    async shareNote(this: DocumentType<Note>, requesterId: mongoose.Types.ObjectId, userEmails: string[]): Promise<{ success: boolean; error?: string }> {
        try {
            if (!userEmails || userEmails.length === 0) {
                return { success: false, error: 'No email addresses provided' };
            }

            if (userEmails.length > MAX_SHARE_BATCH_SIZE) {
                return { success: false, error: `Cannot share with more than ${MAX_SHARE_BATCH_SIZE} users at once` };
            }

            const uniqueEmails = [...new Set(userEmails)];

            if (!this.hasWriteAccess(requesterId)) {
                return { success: false, error: 'Only the owner can share this note' };
            }

            const owner = await mongoose.model('User').findById(requesterId).select('email');
            if (!owner) {
                return { success: false, error: 'Owner not found' };
            }

            const users = await mongoose.model('User').find({ email: { $in: uniqueEmails } }).select('_id email');

            const existingEmails = users.map(u => u.email);
            const nonExistentEmails = uniqueEmails.filter(email => !existingEmails.includes(email));
            if (nonExistentEmails.length > 0) {
                return { success: false, error: `Users not found: ${nonExistentEmails.join(', ')}` };
            }

            if (uniqueEmails.includes(owner.email)) {
                return { success: false, error: 'Cannot share note with yourself' };
            }

            const alreadySharedEmails = users
                .filter(user => this.sharedWith.some(shared =>
                    (shared instanceof mongoose.Types.ObjectId ? shared : (shared as Document & { _id: mongoose.Types.ObjectId })._id).equals(user._id)
                ))
                .map(u => u.email);

            if (alreadySharedEmails.length > 0) {
                return { success: false, error: `Note already shared with: ${alreadySharedEmails.join(', ')}` };
            }

            this.sharedWith.push(...users.map(u => u._id));
            await this.save();

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to share note: ' + (error as Error).message };
        }
    }
}

export const NoteModel = getModelForClass(Note);
