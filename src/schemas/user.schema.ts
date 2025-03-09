import { object, string, TypeOf } from 'zod';
import constants from '@utils/constants';

const { REGEX } = constants;

const register = object({
    body: object({
        email: string({ required_error: 'Email is required' }).email('Email is not valid').min(1).toLowerCase().trim(),
        firstName: string({ required_error: 'Firstname is required' })
            .regex(/^[a-zA-Z\s-]+$/, 'Firstname must only contain letters, spaces, and hyphens')
            .min(1)
            .trim(),
        lastName: string({ required_error: 'Lastname is required' })
            .regex(/^[a-zA-Z\s-]+$/, 'Lastname must only contain letters, spaces, and hyphens')
            .min(1)
            .trim(),
        password: string({ required_error: 'Password is required' })
            .min(8, 'Password is too short - shoud be at least 8 characters')
            .regex(REGEX.capitalLetters, 'Password should contain capital letters')
            .regex(REGEX.specialSymbol, 'Password should contain special characters')
            .regex(REGEX.number, 'Password should contain numbers')
            .regex(REGEX.smallLetters, 'Password should contain small letters'),
    }).strict(),
});

export type RegisterUserInput = TypeOf<typeof register>['body'];

const userSchema = {
    register,
};

export default userSchema;
