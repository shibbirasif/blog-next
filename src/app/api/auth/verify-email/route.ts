import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ message: 'Verification token is missing.' }, { status: 400 });
        }

        const verifiedUser = await userService.verifyUserByVerificationToken(token);

        if (!verifiedUser) {
            return NextResponse.json({ message: 'Invalid or expired verification token.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Email verified successfully!' }, { status: 200 });

    } catch (error) {
        console.error('Email verification error in API route:', error);
        return NextResponse.json({ message: 'An unexpected error occurred during verification.' }, { status: 500 });
    }
}