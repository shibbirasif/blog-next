'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <Button
            color="gray"
            onClick={() => router.back()}
        >
            Go Back
        </Button>
    );
}
