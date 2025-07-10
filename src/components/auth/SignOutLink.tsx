'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignOutLinkProps {
    className?: string;
}

export default function SignOutLink({ className }: SignOutLinkProps) {
    const router = useRouter();

    const handleSignOut = async (event: React.MouseEvent) => {
        console.log("Sign out clicked");
        event.preventDefault();
        await signOut();
        router.push('/');
        router.refresh();
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