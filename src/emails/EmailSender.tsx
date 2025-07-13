import * as React from 'react';
import { sendEmail } from '@/lib/email';
import { render } from '@react-email/render';
import { UserDto } from '@/dtos/UserDto';
import { EmailVerification } from '@/emails/components/EmailVerification';
import { PasswordResetEmail } from '@/emails/components/PasswordResetEmail';
import { PasswordChangedEmail } from '@/emails/components/PasswordChangedEmail';
import { getBaseUrl, getPlatformName } from '@/utils/common';

export interface TemplateData {
    userName: string;
    platformName: string;
    currentYear: number;
    [key: string]: unknown;
}

export interface VerificationTemplateData extends TemplateData {
    verificationUrl: string;
    expirationHours: number;
}

export interface PasswordResetTemplateData extends TemplateData {
    resetUrl: string;
    expirationHours: number;
}

export interface PasswordChangedTemplateData extends TemplateData {
    changeDate: string;
    supportUrl: string;
}

export class EmailSender {
    public async sendVerificationEmail(user: UserDto, verificationToken: string): Promise<void> {
        const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

        const templateData: VerificationTemplateData = {
            userName: user.name,
            verificationUrl,
            expirationHours: 24,
            platformName: getPlatformName(),
            currentYear: new Date().getFullYear(),
        };

        const html = await render(<EmailVerification {...templateData} />, {
            pretty: true,
        });

        const result = await sendEmail({
            to: user.email,
            subject: 'Verify your email address',
            html: html
        });

        if (!result.success) {
            throw new Error(`Failed to send verification email: ${result.error}`);
        }
    }

    public async sendPasswordResetEmail(user: UserDto, resetToken: string): Promise<void> {
        const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${resetToken}`;

        const templateData: PasswordResetTemplateData = {
            userName: user.name,
            resetUrl,
            expirationHours: 1,
            platformName: getPlatformName(),
            currentYear: new Date().getFullYear(),
        };

        const html = await render(<PasswordResetEmail {...templateData} />, {
            pretty: true,
        });

        const result = await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            html: html
        });

        if (!result.success) {
            throw new Error(`Failed to send password reset email: ${result.error}`);
        }
    }

    public async sendPasswordChangedNotification(user: UserDto): Promise<void> {
        const templateData: PasswordChangedTemplateData = {
            userName: user.name,
            changeDate: new Date().toLocaleDateString(),
            supportUrl: `${getBaseUrl()}/support`,
            platformName: getPlatformName(),
            currentYear: new Date().getFullYear(),
        };

        const html = await render(<PasswordChangedEmail {...templateData} />, {
            pretty: true,
        });

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

export const emailSender = new EmailSender();