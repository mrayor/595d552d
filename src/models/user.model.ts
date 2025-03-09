import { Logger } from '@configs/winston.config';
import { getModelForClass, modelOptions, prop, Severity, pre, DocumentType } from '@typegoose/typegoose';
import argon2 from 'argon2';

@pre<User>('save', async function () {
    if (!this.isModified('password')) return;

    const hash = await argon2.hash(this.password);
    this.password = hash;
})
@modelOptions({ options: { allowMixed: Severity.ALLOW }, schemaOptions: { timestamps: true } })
export class User {
    @prop({ lowercase: true, required: true, unique: true, trim: true })
    email: string;

    @prop({ required: true, trim: true })
    firstName: string;

    @prop({ required: true, trim: true })
    lastName: string;

    @prop({ required: true })
    password: string;

    async validatePassword(this: DocumentType<User>, candidatePassword: string): Promise<boolean> {
        try {
            return await argon2.verify(this.password, candidatePassword);
        } catch (error) {
            Logger.error('Could not validate password', error);
            return false;
        }
    }
}

const UserModel = getModelForClass(User);

export default UserModel;
