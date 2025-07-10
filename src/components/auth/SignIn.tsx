'use client';

import { useRouter } from "next/navigation";

interface SignOutLinkProps {
    className?: string;
    children?: React.ReactNode;
}

export default function SignIn({ className, children }: SignOutLinkProps) {
    const router = useRouter();

    function handleSignOut(event: React.MouseEvent): void {
        event.preventDefault();
        router.push("/signin");
        router.refresh();
    }

    return (
        <button
            type="button"
            aria-label="Sign Out"
            onClick={handleSignOut}
            className={className || ""} >
            {children}
        </button>
    );
}