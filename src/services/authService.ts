import { dbConnect } from "@/lib/db";
import bcrypt from "bcrypt";
import User from "@/models/User";
import UserSignupPayload from "@/dtos/UserSignupPayload";
import { buildUserDto, UserDto } from "@/dtos/UserDto";
import { generateRandomToken } from "@/lib/tokens";

const SALT_ROUNDS = 10;

class AuthService {
    private async hashPassword(password: string): Promise<{ salt: string; hash: string }> {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return { salt, hash };
    }

    private async comparePassword(plainPassword: string, storedHash: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(plainPassword, storedHash);
        return isMatch;
    }

    public async loginUser(email: string, password: string): Promise<UserDto | null> {
        await dbConnect();
        const user = await User.findOne({ email }).select('+password_hash +password_salt');

        if (!user) {
            return null;
        }

        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        if (isPasswordValid) {
            return buildUserDto(user);
        } else {
            return null;
        }
    }

    public async signupUser(userData: UserSignupPayload): Promise<UserDto> {
        await dbConnect();

        const { name, email, password } = userData;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const { salt, hash } = await this.hashPassword(password);

        const newUser = await new User({
            name,
            email,
            password_salt: salt,
            password_hash: hash,
            emailVerificationToken: generateRandomToken(),
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }).save();

        // await emailService.sendVerificationEmail(newUser);
        return buildUserDto(newUser);
    }
}

export const authService = new AuthService();