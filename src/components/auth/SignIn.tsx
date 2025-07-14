'use client';

import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";

interface SignOutLinkProps {
    className?: string;
    children?: React.ReactNode;
}

export default function SignIn({ className, children }: SignOutLinkProps) {
    const router = useRouter();

    function handleSignIn(event: React.MouseEvent): void {
        event.preventDefault();
        router.push("/signin");
        router.refresh();
    }

    return (
        <Button
            type="button"
            aria-label="Sign Out"
            onClick={handleSignIn}
            className={className || ""} >
            {children}
        </Button>
    );
}