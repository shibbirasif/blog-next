"use client";

import { useRouter } from 'next/navigation';
import { ClientCreateArticleInput, ClientUpdateArticleInput, clientCreateArticleSchema } from '@/validations/article';
import { TagDto } from '@/dtos/TagDto';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { APP_ROUTES } from '@/constants/appRoutes';
import ArticleForm from '@/components/article/ArticleForm';

interface NewArticleProps {
    availableTags: TagDto[];
    userId: string;
}

export default function NewArticle({ availableTags, userId }: NewArticleProps) {
    const router = useRouter();

    const defaultValues = {
        title: '',
        content: '',
        tags: [],
        isPublished: false
    };

    const handleSubmit = async (data: ClientCreateArticleInput | ClientUpdateArticleInput) => {
        const article = await apiFetcher(API_ROUTES.ARTICLE.CREATE(), {
            method: 'POST',
            body: {
                ...data,
                author: userId
            }
        });

        setTimeout(() => {
            router.push(APP_ROUTES.ARTICLE.SHOW(article._id));
            router.refresh();
        }, 1500);
    };

    return (
        <ArticleForm
            availableTags={availableTags}
            validationSchema={clientCreateArticleSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            mode="create"
        />
    );
}