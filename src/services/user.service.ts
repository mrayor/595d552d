import UserModel from '@models/user.model';
import { RegisterUserInput } from '@schemas/user.schema';

const createUser = (input: RegisterUserInput) => {
    return UserModel.create(input);
};

const findUserByEmail = (email: string) => {
    return UserModel.findOne({ email }).exec();
};

const findUserById = (id: string) => {
    return UserModel.findById(id, { password: 0 }).exec();
};

const getUsersByEmails = (emails: string[]) => {
    return UserModel.find({ email: { $in: emails } }).exec();
};

const userService = {
    createUser,
    findUserByEmail,
    findUserById,
    getUsersByEmails,
};

export default userService;
