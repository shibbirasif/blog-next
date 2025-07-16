import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import ArticleService from '@/services/articleService';
import { updateArticleSchema, publishArticleSchema } from '@/validations/article';

interface RouteParams {
    params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const article = await ArticleService.getArticleById(params.id);

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // If article is not published, only the author can view it
        if (!article.isPublished) {
            const session = await auth();

            if (!session?.user || session.user.id !== article.author._id.toString()) {
                return NextResponse.json(
                    { error: 'Article not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json({ article });

    } catch (error) {
        console.error('Error fetching article:', error);

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify ownership
        const isOwner = await ArticleService.verifyOwnership(params.id, session.user.id);

        if (!isOwner) {
            return NextResponse.json(
                { error: 'Forbidden: You can only edit your own articles' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Check if this is a publish/unpublish request
        if ('isPublished' in body && Object.keys(body).length === 1) {
            const validationResult = publishArticleSchema.safeParse({
                id: params.id,
                isPublished: body.isPublished
            });

            if (!validationResult.success) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: validationResult.error.errors
                    },
                    { status: 400 }
                );
            }

            const article = await ArticleService.togglePublishStatus(
                params.id,
                body.isPublished
            );

            return NextResponse.json({
                message: `Article ${body.isPublished ? 'published' : 'unpublished'} successfully`,
                article
            });
        }

        // Regular update
        const validationResult = updateArticleSchema.safeParse({
            ...body,
            id: params.id
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const { id, ...updateData } = validationResult.data;
        const article = await ArticleService.updateArticle(params.id, updateData);

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Article updated successfully',
            article
        });

    } catch (error) {
        console.error('Error updating article:', error);

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify ownership
        const isOwner = await ArticleService.verifyOwnership(params.id, session.user.id);

        if (!isOwner) {
            return NextResponse.json(
                { error: 'Forbidden: You can only delete your own articles' },
                { status: 403 }
            );
        }

        const success = await ArticleService.deleteArticle(params.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Article deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting article:', error);

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
