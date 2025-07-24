import { authService } from "@/services/authService";
import { resetPasswordSchema } from "@/validations/auth";
import { logAuthError } from "@/lib/logger";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = resetPasswordSchema.parse(body);

        const success = await authService.resetPassword(token, password);

        if (!success) {
            return NextResponse.json({
                message: 'Invalid or expired reset token'
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Password has been reset successfully'
        }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            logAuthError('warn', 'Reset password validation failed', '/api/auth/reset-password', error.errors, request);
            return NextResponse.json({
                message: 'Validation Error',
                errors: error.errors
            }, { status: 400 });
        } else if (error instanceof Error) {
            logAuthError('error', 'Reset password request failed', '/api/auth/reset-password', error, request);
            return NextResponse.json({
                message: 'Failed to reset password'
            }, { status: 500 });
        }
        logAuthError('error', 'Unknown error in reset password', '/api/auth/reset-password', error, request);
        return NextResponse.json({
            message: 'Failed to reset password'
        }, { status: 500 });
    }
}
