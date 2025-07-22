'use client';

import { ClientSignupInput, clientSignupSchema } from "@/validations/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetcher } from '@/utils/apiFetcher';
import { omit } from '@/utils/common';

import { Button, Label, TextInput, Alert, Spinner, Card, DarkThemeToggle } from 'flowbite-react';
import Image from 'next/image';
import { APP_ROUTES } from '@/constants/appRoutes';

export default function SignUpPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ClientSignupInput>({
        resolver: zodResolver(clientSignupSchema),
    });

    const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
    const [signupError, setSignupError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: ClientSignupInput) => {
        setSignupSuccess(null);
        setSignupError(null);

        try {
            const signupData = omit(data, 'confirmPassword');
            await apiFetcher('/api/auth/signup', {
                method: 'POST',
                body: signupData
            });

            setSignupSuccess('Account created successfully! You can now sign in.');
            router.replace("/auth/signin");
            router.refresh();
        } catch (error: unknown) {
            console.error('Signup error:', error);
            setSignupError(error instanceof Error && error.message ? error.message : 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 py-8 p-4 relative">
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

            <Card className="w-full max-w-lg">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Join our community and start sharing your stories.
                        </p>
                    </div>

                    {signupSuccess && (
                        <Alert color="success" onDismiss={() => setSignupSuccess(null)} className="mb-4">
                            <span className="font-bold">Success!</span> {signupSuccess}
                            <Link href="/auth/signin" className="ml-2 text-green-800 underline hover:no-underline">Sign In here</Link>
                        </Alert>
                    )}

                    {signupError && (
                        <Alert color="failure" onDismiss={() => setSignupError(null)} className="mb-4">
                            <span className="font-bold">Error!</span> {signupError}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Name</Label>
                            </div>
                            <TextInput
                                id="name"
                                type="text"
                                {...register('name')}
                                placeholder="Your Name"
                                required={false}
                                disabled={isSubmitting}
                                color={errors.name ? "failure" : "gray"}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="email">Email</Label>
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="name@example.com"
                                required={false}
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

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                            </div>
                            <TextInput
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                required={false}
                                disabled={isSubmitting}
                                color={errors.confirmPassword ? "failure" : "gray"}
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner size="sm" light={true} className="mr-2" />
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}