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
    emailVerificationToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export function buildUserDto(userDoc: IUser): UserDto {
    return {
        _id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        isActive: userDoc.isActive,
        isEmailVerified: userDoc.isEmailVerified,
        emailVerificationToken: userDoc.isEmailVerified? undefined: userDoc.emailVerificationToken,
        roles: userDoc.roles as UserRole[],
        bio: userDoc.bio || '',
        avatar: userDoc.avatar || '',
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
    };
}