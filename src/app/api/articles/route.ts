import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { articleService } from '@/services/articleService';
import { uploadedFileService } from '@/services/UploadedFileService';
import { AttachableType } from '@/models/UploadedFile';
import { createArticleSchema } from '@/validations/article';
import { ArticleSortOrder } from '@/constants/enums';
import { PAGINATION } from '@/constants/common';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const validationResult = createArticleSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const articleData = validationResult.data;

        if (articleData.author !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot create article for another user' },
                { status: 403 }
            );
        }

        const article = await articleService.createArticle(articleData);

        // Extract uploadedFileIds from body (client schema)
        const uploadedFileIds: string[] = Array.isArray(body.uploadedFileIds) ? body.uploadedFileIds : [];
        uploadedFileService.attachAllToEntity(uploadedFileIds, AttachableType.ARTICLE, article.id, session.user.id);

        return NextResponse.json({
            message: 'Article created successfully',
            article: {
                id: article.id,
                title: article.title,
                slug: article.slug,
                isPublished: article.isPublished,
                createdAt: article.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating article:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || PAGINATION.DEFAULT_PAGE.toString());
        const limit = parseInt(searchParams.get('limit') || PAGINATION.ARTICLES_PER_PAGE.toString());
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const authorId = searchParams.get('author');
        const sortByParam = searchParams.get('sortBy');

        const sortBy: ArticleSortOrder =
            sortByParam === ArticleSortOrder.NEWEST || sortByParam === ArticleSortOrder.OLDEST
                ? sortByParam as ArticleSortOrder
                : ArticleSortOrder.NEWEST;

        let result;

        if (authorId) {
            const session = await auth();

            const includeUnpublished = session?.user?.id === authorId;

            result = await articleService.getArticlesByAuthor(authorId, {
                page,
                limit,
                published: includeUnpublished ? undefined : true,
                sortBy
            });
        } else {
            result = await articleService.getPublishedArticles({
                page,
                limit,
                tags,
                search,
                sortBy
            });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching articles:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
