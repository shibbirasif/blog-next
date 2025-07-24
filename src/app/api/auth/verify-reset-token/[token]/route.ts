import { authService } from "@/services/authService";
import { logAuthError } from "@/lib/logger";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        token: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const { token } = await params;

    try {
        if (!token) {
            return NextResponse.json({
                message: 'Reset token is required'
            }, { status: 400 });
        }

        const user = await authService.validateResetToken(token);

        if (!user) {
            return NextResponse.json({
                message: 'Invalid or expired reset token'
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Reset token is valid',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            logAuthError('error', 'Verify reset token failed', `/api/auth/verify-reset-token/[token]`, error, request, { token });
            return NextResponse.json({
                message: 'Failed to verify reset token'
            }, { status: 500 });
        }
        logAuthError('error', 'Unknown error in verify reset token', `/api/auth/verify-reset-token/[token]`, error, request, { token });
        return NextResponse.json({
            message: 'Failed to verify reset token'
        }, { status: 500 });
    }
}
