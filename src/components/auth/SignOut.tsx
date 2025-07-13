'use client';
import { signOut } from 'next-auth/react';

interface SignOutLinkProps {
    className?: string;
}

export default function SignOut({ className }: SignOutLinkProps) {
    const handleSignOut = async (event: React.MouseEvent) => {
        event.preventDefault();
        await signOut();
    };

    return (
        <button
            type="button"
            aria-label="Sign Out"
            onClick={handleSignOut}
            className={className || ""} >
            Sign Out
        </button>
    );
}