import { buildUserDto, UserDto } from '@/dtos/UserDto';
import { dbConnect } from '@/lib/db';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

class UserService {
    public async updateUser(id: string, updateData: Partial<IUser>): Promise<UserDto | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).lean() as IUser | null;

            if (!updatedUser) {
                return null;
            }

            return buildUserDto(updatedUser);

        } catch (error) {
            console.error(`UserService.updateUser(${id}) error:`, error);
            throw new Error(`Failed to update user with ID: ${id}.`);
        }
    }

    public async getAllUsers(): Promise<Array<UserDto>> {
        await dbConnect();

        try {
            const users = await User.find({}).lean() as IUser[];
            return users.map(user => (buildUserDto(user)));

        } catch (error) {
            console.error('UserService.getAllUsers error:', error);
            throw new Error('Failed to retrieve users.');
        }
    }

    public async getUserById(id: string): Promise<UserDto | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        try {
            const user = await User.findById(id).lean() as IUser | null; // Added .lean() for consistency with updateUser

            console.log(`UserService.getUserById(${id}) user:`, user);

            if (!user) {
                return null;
            }

            return buildUserDto(user);

        } catch (error) {
            console.error(`UserService.getUserById(${id}) error:`, error);
            throw new Error(`Failed to retrieve user with ID: ${id}.`);
        }
    }

    public async getUserByEmail(email: string): Promise<UserDto | null> {
        await dbConnect();

        try {
            const user = await User.findOne({ email: email.toLowerCase() }).lean() as IUser | null; // Added .lean()

            if (!user) {
                return null;
            }

            return buildUserDto(user);

        } catch (error) {
            console.error(`UserService.getUserByEmail(${email}) error:`, error);
            throw new Error(`Failed to retrieve user with email: ${email}.`);
        }
    }

    public async verifyUserByVerificationToken(token: string): Promise<UserDto | null> {
        await dbConnect();

        try {
            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            });

            if (!user) {
                return null;
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            return buildUserDto(user);

        } catch (error) {
            console.error(`UserService.verifyUserByVerificationToken error:`, error);
            throw new Error(`Failed to verify user with token.`);
        }
    }
}

export const userService = new UserService();