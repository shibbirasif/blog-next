'use server';

import { sendEmail } from '@/lib/email';
import { generateRandomToken } from '@/lib/tokens';
import { userService } from '@/services/userService';
import z from 'zod';

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const resetPasswordFormSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function sendVerificationEmail(userId: string) {
    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        if (user.isEmailVerified) {
            return { success: false, error: 'Email already verified.' };
        }

        const verificationToken = generateRandomToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await userService.updateUser(user._id, {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
        });
        const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`
        const emailHtml = `
            <p>Hello ${user.name || user.email},</p>
            <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationLink}">Verify My Email</a></p>
            <p>If you did not register for this account, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        `;
        const emailInfo = await sendEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            html: emailHtml,
        });
        if (emailInfo.success) {
            return { success: true, message: 'Verification email sent!' };
        } else {
            console.error('Failed to send verification email:', emailInfo.error);
            return { success: false, error: 'Failed to send verification email. Please try again.' };
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: 'Failed to send verification email.' };
    }
}

export async function verifyEmailAction(token: string, email: string) {
    
}