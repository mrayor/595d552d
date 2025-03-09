import { object, string, TypeOf } from 'zod';

const login = object({
    body: object({
        email: string({ required_error: 'Email is required' }).email('Email is not valid').min(1).toLowerCase().trim(),
        password: string({ required_error: 'Password is required' }).min(1),
    }).strict(),
});

export type LoginUserInput = TypeOf<typeof login>['body'];


const authSchema = {
    login,
};

export default authSchema;
