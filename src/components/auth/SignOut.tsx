'use client';

import { DropdownItem } from 'flowbite-react';
import { signOut } from 'next-auth/react';

interface SignOutLinkProps {
    className?: string;
    children?: React.ReactNode;
}

export default function SignOut({ children, className }: SignOutLinkProps) {
    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <DropdownItem className={className || ""} onClick={handleSignOut}>
            {children}
        </DropdownItem>
    );
}