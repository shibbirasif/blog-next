import mongoose, { Schema, Document, Model } from "mongoose";
import UserRole from "@/models/UserRole";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    isActive: boolean;
    email: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    password_salt: string;
    password_hash: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    roles: UserRole[];
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        validate: {
            validator: (v: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
            message: "Invalid email format",
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        required: false,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        required: false,
        select: false,
    },
    roles: {
        type: [String],
        enum: Object.values(UserRole),
        default: [UserRole.READER],
    },
    password_salt: {
        type: String,
        required: [true, 'Password salt is required'],
        select: false,
    },
    password_hash: {
        type: String,
        required: [true, "Password hash is required"],
        select: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
        select: false,
    },
    bio: {
        type: String,
        default: '',
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    avatar: {
        type: String,
        default: '',
        maxlength: [500, 'Avatar URL cannot exceed 500 characters'],
    },
}, {
    timestamps: true
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;