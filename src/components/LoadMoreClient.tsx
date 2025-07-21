"use client";

import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';

interface LoadMoreClientProps {
    currentPage: number;
    searchParams?: URLSearchParams;
}

export default function LoadMoreClient({ currentPage, searchParams }: LoadMoreClientProps) {
    const router = useRouter();

    const handleLoadMore = () => {
        const params = new URLSearchParams(searchParams);
        params.set('page', (currentPage + 1).toString());

        const queryString = params.toString();
        const url = queryString ? `/?${queryString}` : '/';

        router.push(url);
    };

    return (
        <div className="text-center">
            <Button
                color="gray"
                size="lg"
                onClick={handleLoadMore}
            >
                Load More Articles
            </Button>
        </div>
    );
}
