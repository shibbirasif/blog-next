'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface SignOutLinkProps {
    className?: string;
}

export default function SignOutLink({ className }: SignOutLinkProps) {
    const handleSignOut = async (event: React.MouseEvent) => {
        event.preventDefault();
        await signOut({ callbackUrl: '/' });
    };

    return (
        <Link
            href="/auth/signout"
            onClick={handleSignOut}
            className={className || "text-white hover:underline transition-colors"} >
            Sign Out
        </Link>
    );
}