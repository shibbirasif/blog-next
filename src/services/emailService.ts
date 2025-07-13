import { sendEmail } from '@/lib/email';
import { IUser } from '@/models/User';
import {
    emailTemplateService,
    EmailVerificationTemplateData,
    PasswordResetTemplateData,
    PasswordChangedTemplateData
} from '@/services/emailTemplateService';

function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export class EmailService {
    public async sendVerificationEmail(user: IUser, verificationToken: string): Promise<void> {
        const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

        const templateData: EmailVerificationTemplateData = {
            userName: user.name,
            verificationUrl,
            expirationHours: 24,
            platformName: process.env.PLATFORM_NAME || 'Blog Next',
            currentYear: new Date().getFullYear(),
        };

        const html = await emailTemplateService.renderEmailVerificationEmail(templateData);

        const result = await sendEmail({
            to: user.email,
            subject: 'Verify your email address',
            html: html
        });

        if (!result.success) {
            throw new Error(`Failed to send verification email: ${result.error}`);
        }
    }

    public async sendPasswordResetEmail(user: IUser, resetToken: string): Promise<void> {
        const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${resetToken}`;

        const templateData: PasswordResetTemplateData = {
            userName: user.name,
            resetUrl,
            expirationHours: 1,
            platformName: process.env.PLATFORM_NAME || 'Our Platform',
            currentYear: new Date().getFullYear(),
        };

        const html = await emailTemplateService.renderPasswordResetEmail(templateData);

        const result = await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            html: html
        });

        if (!result.success) {
            throw new Error(`Failed to send password reset email: ${result.error}`);
        }
    }

    public async sendPasswordChangedNotification(user: IUser): Promise<void> {
        const templateData: PasswordChangedTemplateData = {
            userName: user.name,
            changeDate: new Date().toLocaleDateString(),
            supportUrl: `${getBaseUrl()}/support`,
            platformName: process.env.PLATFORM_NAME || 'Our Platform',
            currentYear: new Date().getFullYear(),
        };

        const html = await emailTemplateService.renderPasswordChangedEmail(templateData);

        const result = await sendEmail({
            to: user.email,
            subject: 'Password Changed Successfully',
            html: html
        });

        if (!result.success) {
            throw new Error(`Failed to send password changed notification: ${result.error}`);
        }
    }
}

export const emailService = new EmailService();