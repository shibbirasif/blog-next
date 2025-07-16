import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import ArticleService from '@/services/articleService';
import { createArticleSchema } from '@/validations/article';

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

        // Validate the request body
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

        // Ensure the author matches the authenticated user
        if (articleData.author !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot create article for another user' },
                { status: 403 }
            );
        }

        // Create the article
        const article = await ArticleService.createArticle(articleData);

        return NextResponse.json({
            message: 'Article created successfully',
            article: {
                _id: article._id,
                title: article.title,
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const authorId = searchParams.get('author');

        let result;

        if (authorId) {
            // Get articles by specific author
            const session = await auth();

            // If requesting own articles, include unpublished ones
            const includeUnpublished = session?.user?.id === authorId;

            result = await ArticleService.getArticlesByAuthor(authorId, {
                page,
                limit,
                published: includeUnpublished ? undefined : true
            });
        } else {
            // Get public published articles
            result = await ArticleService.getPublishedArticles({
                page,
                limit,
                tags,
                search
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
