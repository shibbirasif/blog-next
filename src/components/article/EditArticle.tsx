"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientUpdateArticleInput, clientUpdateArticleSchema } from '@/validations/article';
import { apiFetcher } from '@/utils/apiFetcher';
import { TagDto } from '@/dtos/TagDto';
import { ArticleDto } from '@/dtos/ArticleDto';
import { API_ROUTES } from '@/constants/apiRoutes';
import ArticleForm from '@/components/article/ArticleForm';
import { APP_ROUTES } from '@/constants/appRoutes';

interface EditArticleProps {
    article: ArticleDto;
    availableTags: TagDto[];
    userId: string;
}

export default function EditArticle({ article, availableTags, userId }: EditArticleProps) {
    const router = useRouter();
    const [isOperating, setIsOperating] = useState(false);

    const handleSubmit = async (data: ClientUpdateArticleInput) => {
        await apiFetcher(API_ROUTES.ARTICLE.UPDATE(article._id), {
            method: 'PUT',
            body: data
        });

        setTimeout(() => {
            router.push(APP_ROUTES.ARTICLE.SHOW(article.slug || article._id));
        }, 1500);
    };

    const handlePublishToggle = async () => {
        setIsOperating(true);

        try {
            const newPublishStatus = !article.isPublished;
            await apiFetcher(API_ROUTES.ARTICLE.UPDATE(article._id), {
                method: 'PUT',
                body: {
                    isPublished: newPublishStatus
                }
            });

            setTimeout(() => {
                router.refresh();
            }, 1000);

        } finally {
            setIsOperating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        setIsOperating(true);

        try {
            await apiFetcher(API_ROUTES.ARTICLE.DELETE(article._id), {
                method: 'DELETE'
            });

            setTimeout(() => {
                router.push(APP_ROUTES.USER.FEED(userId));
            }, 1500);

        } finally {
            setIsOperating(false);
        }
    };

    const defaultValues = {
        title: article.title,
        content: article.content,
        tags: article.tags?.map(tag => tag._id) || [],
        isPublished: article.isPublished
    };

    return (
        <ArticleForm
            availableTags={availableTags}
            article={article}
            validationSchema={clientUpdateArticleSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onPublishToggle={handlePublishToggle}
            isOperating={isOperating}
            mode="edit"
        />
    );
}
