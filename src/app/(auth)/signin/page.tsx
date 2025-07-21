'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { loginSchema, LoginInput } from '@/validations/auth';

export default function SignInPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const [generalError, setGeneralError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: LoginInput) => {
        setGeneralError(null);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes("Invalid credentials")) {
                    setGeneralError("Invalid email or password.");
                } else if (result.error.includes("Missing credentials")) {
                    setGeneralError("Please provide both email and password.");
                } else if (result.error.includes("Authentication failed")) {
                    setGeneralError("Authentication failed. Please check your credentials.");
                } else {
                    setGeneralError("An unexpected error occurred during sign-in.");
                }
            } else if (result?.ok) {
                router.replace("/");
                router.refresh();
            }
        } catch (error) {
            console.error('Sign in error:', error);
            setGeneralError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

                {generalError && (
                    <Alert color="failure" onDismiss={() => setGeneralError(null)} className="mb-4">
                        <span className="font-bold">Error!</span> {generalError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email">Email</Label>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="name@example.com"
                            required={true}
                            disabled={isSubmitting}
                            color={errors.email ? "failure" : "gray"}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            {...register('password')}
                            required={false}
                            disabled={isSubmitting}
                            color={errors.password ? "failure" : "gray"}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" light={true} className="mr-2" />
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}