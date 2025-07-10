// services/userService.ts
import { buildUserDto, UserDto } from '@/dtos/UserDto';
import { dbConnect } from '@/lib/db';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

export const userService = {
    async getAllUsers(): Promise<Array<UserDto>> {
        await dbConnect();

        try {
            const users = await User.find({}).lean() as IUser[];
            return users.map(user => (buildUserDto(user)));

        } catch (error) {
            console.error('UserService.getAllUsers error:', error);
            throw new Error('Failed to retrieve users.');
        }
    },

    async getUserById(id: string): Promise<UserDto | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        try {
            const user = await User.findById(id);

            if (!user) {
                return null;
            }

            return buildUserDto(user);

        } catch (error) {
            console.error(`UserService.getUserById(${id}) error:`, error);
            throw new Error(`Failed to retrieve user with ID: ${id}.`);
        }
    },

    async getUserByEmail(email: string): Promise<UserDto | null> {
        await dbConnect();

        try {
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return null;
            }

            return buildUserDto(user);

        } catch (error) {
            console.error(`UserService.getUserByEmail(${email}) error:`, error);
            throw new Error(`Failed to retrieve user with email: ${email}.`);
        }
    },
};