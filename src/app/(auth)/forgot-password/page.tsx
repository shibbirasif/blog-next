'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, TextInput, Alert, Spinner, Card } from 'flowbite-react';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/validations/auth';
import { apiFetcher } from '@/utils/apiFetcher';
import { APP_ROUTES } from '@/constants/appRoutes';

export default function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const [generalError, setGeneralError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onSubmit = async (data: ForgotPasswordInput) => {
        setGeneralError(null);
        setSuccessMessage(null);

        try {
            const response = await apiFetcher<{ message: string }>('/api/auth/forgot-password', {
                method: 'POST',
                body: data
            });

            setSuccessMessage(response.message);
        } catch (error: unknown) {
            console.error('Forgot password error:', error);
            setGeneralError(error instanceof Error && error.message ? error.message : 'Failed to process password reset request. Please try again.');
        }
    };

    return (
        <Card className="w-full sm:w-md">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {generalError && (
                    <Alert color="failure" onDismiss={() => setGeneralError(null)}>
                        <span className="font-bold">Error!</span> {generalError}
                    </Alert>
                )}

                {successMessage && (
                    <Alert color="success" onDismiss={() => setSuccessMessage(null)}>
                        <span className="font-bold">Success!</span> {successMessage}
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
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" light={true} className="mr-2" />
                                Sending Reset Link...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Remember your password?{' '}
                    <Link href={APP_ROUTES.AUTH.SIGNIN} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Sign In
                    </Link>
                </div>
            </div>
        </Card>
    );
}
