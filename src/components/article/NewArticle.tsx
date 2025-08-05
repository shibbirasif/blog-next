"use client";

import { useRouter } from 'next/navigation';
import { ClientCreateArticleInput, ClientUpdateArticleInput, clientCreateArticleSchema } from '@/validations/article';
import { TagDto } from '@/dtos/TagDto';
import { ArticleDto } from '@/dtos/ArticleDto';
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

    const handleSubmit = async (formData: ClientCreateArticleInput | ClientUpdateArticleInput) => {
        const response = await apiFetcher(API_ROUTES.ARTICLE.CREATE(), {
            method: 'POST',
            body: {
                ...formData,
                author: userId
            }
        }) as { article: ArticleDto };

        const article = response.article;

        router.push(APP_ROUTES.ARTICLE.SHOW(article.slug));
        router.refresh();
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