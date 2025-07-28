'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { apiFetcher } from '@/utils/apiFetcher';
import { Spinner, Card } from 'flowbite-react';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="xl" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function verifyEmail() {
            if (!token) {
                setVerificationStatus('error');
                setMessage('Verification link is missing a token. Please ensure you clicked the full link.');
                return;
            }

            setVerificationStatus('verifying');
            try {
                const data = await apiFetcher<{ message: string }>('/api/auth/verify-email', {
                    method: 'POST',
                    body: { token }
                });

                setVerificationStatus('success');
                setMessage(data.message || 'Your email has been successfully verified! You can now log in.');
            } catch (error: unknown) {
                console.error('Frontend: Error during verification request:', error);
                setVerificationStatus('error');
                setMessage(error instanceof Error ? error.message : 'Failed to verify email. The link might be invalid or expired.');
            }
        }

        if (token && verificationStatus === 'idle') {
            verifyEmail();
        }
    }, [token, verificationStatus]);

    return (
        <Card className="w-full sm:w-md">
            <div className="text-center space-y-4">
                {verificationStatus === 'idle' && (
                    <div>
                        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Checking Verification Link...</h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email.</p>
                    </div>
                )}
                {verificationStatus === 'verifying' && (
                    <div>
                        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Verifying Email...</h2>
                        <p className="text-gray-600 dark:text-gray-400">This should only take a moment.</p>
                    </div>
                )}
                {verificationStatus === 'success' && (
                    <div>
                        <h1 className="mb-4 text-3xl font-bold text-green-600">✅ Email Verified!</h1>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">{message}</p>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">You can now log in to your account.</p>
                        <a href="/signin" className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700">
                            Go to Signin
                        </a>
                    </div>
                )}
                {verificationStatus === 'error' && (
                    <div>
                        <h1 className="mb-4 text-3xl font-bold text-red-600">❌ Verification Failed</h1>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">{message}</p>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">If you believe this is an error or the link has expired, please request a new verification email from your account settings or registration page.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}