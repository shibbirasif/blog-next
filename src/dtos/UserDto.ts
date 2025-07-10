import { IUser } from "@/models/User";
import UserRole from "@/models/UserRole";

export interface UserDto {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
    roles: string[];
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export function buildUserDto(userDoc: IUser): UserDto {
    const userObject = userDoc.toObject();
    return {
        _id: userObject._id.toString(),
        name: userObject.name,
        email: userObject.email,
        isActive: userObject.isActive,
        isEmailVerified: userObject.isEmailVerified,
        roles: userObject.roles as UserRole[],
        bio: userObject.bio || '',
        avatar: userObject.avatar || '',
        createdAt: userObject.createdAt,
        updatedAt: userObject.updatedAt,
    };
}