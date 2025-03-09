import UserModel from '@models/user.model';
import userService from '@services/user.service';

jest.mock('@models/user.model', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

describe('User Service', () => {
    const mockUser = {
        email: 'test@user.com',
        password: 'Pa$$w0rd!',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockCreatedUser = { ...mockUser, _id: 'userId' };
            (UserModel.create as jest.Mock).mockResolvedValue(mockCreatedUser);

            const result = await userService.createUser(mockUser);

            expect(UserModel.create).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockCreatedUser);
        });

        it('should throw an error if user creation fails', async () => {
            const error = new Error('Creation failed');
            (UserModel.create as jest.Mock).mockRejectedValue(error);

            await expect(userService.createUser(mockUser)).rejects.toThrow('Creation failed');
        });
    });
}); 