import { authService } from "@/services/authService";
import { forgotPasswordSchema } from "@/validations/auth";
import { logAuthError } from "@/lib/logger";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = forgotPasswordSchema.parse(body);

        await authService.requestPasswordReset(email);

        return NextResponse.json({
            message: 'If an account with that email exists, a password reset email has been sent.'
        }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            logAuthError('warn', 'Forgot password validation failed', '/api/auth/forgot-password', error.errors, request);
            return NextResponse.json({
                message: 'Validation Error',
                errors: error.errors
            }, { status: 400 });
        } else if (error instanceof Error) {
            logAuthError('error', 'Forgot password request failed', '/api/auth/forgot-password', error, request);
            return NextResponse.json({
                message: 'Failed to process password reset request'
            }, { status: 500 });
        }
        logAuthError('error', 'Unknown error in forgot password', '/api/auth/forgot-password', error, request);
        return NextResponse.json({
            message: 'Failed to process password reset request'
        }, { status: 500 });
    }
}
