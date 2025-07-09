import { signupUser } from "@/services/authService";
import { signupSchema } from "@/validations/auth";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = signupSchema.parse(body);

        const newUser = signupUser({ name, email, password });
        return NextResponse.json({ message: 'User registered successfully!', user: newUser }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Signup validation error:', error.errors);
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        } else if (error instanceof Error) {
            console.error('Signup error:', error.message);
            // Check for specific error messages (like from duplicate email)
            if (error.message.includes('email already exists')) {
                return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
            }
            return NextResponse.json({ message: error.message || 'Failed to create user' }, { status: 500 });
        }
        console.error('API /api/auth/signup error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}