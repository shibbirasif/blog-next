'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { loginSchema, LoginInput } from '@/validations/auth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema), // Apply Zod validation
    });

    const [generalError, setGeneralError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: LoginInput) => {
        setGeneralError(null); // Clear previous errors

        try {
            // Call the client-side signIn function
            // Setting redirect: false prevents NextAuth from automatically redirecting
            // and allows us to handle the success/error logic manually.
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            console.log('SignIn result:', result);

            if (result?.error) {
                console.log('SignIn error:', result.error);
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
                console.log('SignIn successful:', result);
                router.replace("/");
                router.refresh();
            }
        } catch (error) {
            setGeneralError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-text-primary">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

                {generalError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {generalError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-md font-medium">Email</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')} // Connects input to react-hook-form
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                            disabled={isSubmitting}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-md font-medium">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register('password')} // Connects input to react-hook-form
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                            disabled={isSubmitting}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting} // Disable button during submission
                        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:text-secondary">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}