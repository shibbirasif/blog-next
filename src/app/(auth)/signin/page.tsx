'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Label, TextInput, Alert, Spinner, Card, DarkThemeToggle } from 'flowbite-react';
import { loginSchema, LoginInput } from '@/validations/auth';
import Image from 'next/image';
import { APP_ROUTES } from '@/constants/appRoutes';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
            {/* Header with Logo and Theme Toggle */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <Link href={APP_ROUTES.HOME} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <Image
                        src="/images/logo-no-bg.png"
                        alt="Blog Next Logo"
                        width={32}
                        height={32}
                        className="h-12 w-auto"
                    />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Blog Next</span>
                </Link>
                <DarkThemeToggle />
            </div>

            <Card className="w-full max-w-md">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Welcome back! Please sign in to your account.
                        </p>
                    </div>

                    {generalError && (
                        <Alert color="failure" onDismiss={() => setGeneralError(null)}>
                            <span className="font-bold">Error!</span> {generalError}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="email">Email Address</Label>
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="name@example.com"
                                    required={true}
                                    disabled={isSubmitting}
                                    color={errors.email ? "failure" : "gray"}
                                    sizing="lg"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                            </div>

                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    placeholder="••••••••"
                                    required={false}
                                    disabled={isSubmitting}
                                    color={errors.password ? "failure" : "gray"}
                                    sizing="lg"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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

                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Create account
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}