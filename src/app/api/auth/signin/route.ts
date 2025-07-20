// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { authService } from '@/services/authService';
import { loginSchema } from '@/validations/auth';
import z from 'zod';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        await dbConnect();

        const user = await authService.loginUser(email, password);

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const authenticatedUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar || null,
            roles: user.roles,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
        };

        console.log('authenticatedUser', authenticatedUser);
        return NextResponse.json(authenticatedUser, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('API /api/auth/signin: Zod Validation Error:', error.errors);
            return NextResponse.json(
                {
                    message: 'Validation Error',
                    errors: error.errors.map(err => ({
                        path: err.path,
                        message: err.message,
                    })),
                },
                { status: 400 });
        } else if (error instanceof Error) {
            console.error('API /api/auth/signin: Application Error:', error.message);
            return NextResponse.json({ message: error.message || 'Authentication failed' }, { status: 401 });
        }
        else {
            console.error('API /api/auth/sign: Unexpected Internal Server Error:', error);
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    }
}