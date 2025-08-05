import { IUser } from "@/models/User";
import UserRole from "@/models/UserRole";
import { getUploadedFileUrl } from "@/utils/fileUpload";
import mongoose from "mongoose";

export interface UserDto {
    id: string;
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
    const avatar = userDoc.avatar as unknown as { _id: mongoose.Types.ObjectId; url: string }; // Populated author

    return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        isActive: userDoc.isActive,
        isEmailVerified: userDoc.isEmailVerified,
        emailVerificationToken: userDoc.isEmailVerified? undefined: userDoc.emailVerificationToken,
        roles: userDoc.roles as UserRole[],
        bio: userDoc.bio || '',
        avatar: userDoc.avatar ? getUploadedFileUrl({ id: avatar._id.toString(), url: avatar.url }) : '',
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
    };
}