'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { HiOutlinePencil } from 'react-icons/hi';
import { APP_ROUTES } from '@/constants/appRoutes';

interface EditButtonProps {
    authorId: string;
    articleId: string;
}

export default function EditButton({ authorId, articleId }: EditButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = () => {
        setIsLoading(true);
        router.push(APP_ROUTES.USER.ARTICLE.EDIT(authorId, articleId));
    };

    return (
        <Button
            color="blue"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="ml-4"
        >
            <HiOutlinePencil className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Edit'}
        </Button>
    );
}
