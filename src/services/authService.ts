import { dbConnect } from "@/lib/db";
import bcrypt from "bcrypt";
import User, { IUser } from "@/models/User";
import UserSignupPayload from "@/dtos/UserSignupPayload";
import { buildUserDto, UserDto } from "@/dtos/UserDto";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
}

async function comparePassword(plainPassword: string, storedHash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
}

export async function loginUser(email: string, password: string): Promise<UserDto | null> {
    await dbConnect();

    const user = await User.findOne({ email }).select('+password_hash +password_salt');

    if (!user) {
        return null;
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (isPasswordValid) {
        return buildUserDto(user);
    } else {
        return null;
    }
}

export async function signupUser(userData: UserSignupPayload): Promise<UserDto | null> {
    await dbConnect();

    const { name, email, password } = userData;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error('User with this email already exists.');
    }

    const { salt, hash } = await hashPassword(password);

    const newUser = await new User({
        name,
        email,
        password_salt: salt,
        password_hash: hash
    }).save();

    return buildUserDto(newUser);
}
