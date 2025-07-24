'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Label, TextInput, Alert, Spinner, Card } from 'flowbite-react';
import { clientResetPasswordSchema, ClientResetPasswordInput } from '@/validations/auth';
import { apiFetcher } from '@/utils/apiFetcher';
import { APP_ROUTES } from '@/constants/appRoutes';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="xl" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ClientResetPasswordInput>({
        resolver: zodResolver(clientResetPasswordSchema),
    });

    const [generalError, setGeneralError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setTokenError('Reset token is missing. Please check your email and click the full reset link.');
            setIsValidatingToken(false);
            return;
        }

        // Validate the token
        const validateToken = async () => {
            try {
                await apiFetcher(`/api/auth/verify-reset-token/${token}`);
                setIsValidatingToken(false);
            } catch (error: unknown) {
                console.error('Token validation error:', error);
                setTokenError(error instanceof Error && error.message ? error.message : 'Invalid or expired reset token.');
                setIsValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const onSubmit = async (data: ClientResetPasswordInput) => {
        if (!token) {
            setGeneralError('Reset token is missing.');
            return;
        }

        setGeneralError(null);
        setSuccessMessage(null);

        try {
            const response = await apiFetcher<{ message: string }>('/api/auth/reset-password', {
                method: 'POST',
                body: {
                    token,
                    password: data.password
                }
            });

            setSuccessMessage(response.message);
            // Redirect to signin after a delay
            setTimeout(() => {
                router.replace(APP_ROUTES.AUTH.SIGNIN);
            }, 3000);
        } catch (error: unknown) {
            console.error('Reset password error:', error);
            setGeneralError(error instanceof Error && error.message ? error.message : 'Failed to reset password. Please try again.');
        }
    };

    if (isValidatingToken) {
        return (
            <Card className="w-full max-w-md">
                <div className="text-center space-y-4">
                    <Spinner size="lg" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Validating Reset Token...</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we verify your reset link.</p>
                </div>
            </Card>
        );
    }

    if (tokenError) {
        return (
            <Card className="w-full max-w-md">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-600">❌ Invalid Reset Link</h1>
                    <p className="text-gray-700 dark:text-gray-300">{tokenError}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        The reset link may have expired or been used already. Please request a new password reset.
                    </p>
                    <div className="space-y-2">
                        <Link href={APP_ROUTES.AUTH.FORGOT_PASSWORD}>
                            <Button className="w-full">Request New Reset Link</Button>
                        </Link>
                        <Link href={APP_ROUTES.AUTH.SIGNIN}>
                            <Button color="gray" className="w-full">Back to Sign In</Button>
                        </Link>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Enter your new password below.
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
                        <p className="mt-1 text-sm">Redirecting to sign in page...</p>
                    </Alert>
                )}

                {!successMessage && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="password">New Password</Label>
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    placeholder="••••••••"
                                    required={true}
                                    disabled={isSubmitting}
                                    color={errors.password ? "failure" : "gray"}
                                    sizing="lg"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
                            </div>

                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                </div>
                                <TextInput
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword')}
                                    placeholder="••••••••"
                                    required={true}
                                    disabled={isSubmitting}
                                    color={errors.confirmPassword ? "failure" : "gray"}
                                    sizing="lg"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner size="sm" light={true} className="mr-2" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                )}

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
