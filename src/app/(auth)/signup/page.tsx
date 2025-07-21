'use client';

import { ClientSignupInput, clientSignupSchema } from "@/validations/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetcher } from '@/utils/apiFetcher';
import { omit } from '@/utils/common';

import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';

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
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8 text-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>

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

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="font-medium text-blue-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}