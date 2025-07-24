import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { articleService } from '@/services/articleService';
import { updateArticleSchema, publishArticleSchema } from '@/validations/article';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        console.log('Fetching article with ID:', id);
        let article;

        try {
            // Try to fetch by slug first (for SEO-friendly routing)
            article = await articleService.getArticleBySlug(id);
        } catch {
            article = await articleService.getArticleById(id);
        }

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

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
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const isOwner = await articleService.verifyOwnership(id, session.user.id);

        if (!isOwner) {
            return NextResponse.json(
                { error: 'Forbidden: You can only edit your own articles' },
                { status: 403 }
            );
        }

        const body = await request.json();

        if ('isPublished' in body && Object.keys(body).length === 1) {
            const validationResult = publishArticleSchema.safeParse({
                id: id,
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

            const article = await articleService.togglePublishStatus(
                id,
                body.isPublished
            );

            return NextResponse.json({
                message: `Article ${body.isPublished ? 'published' : 'unpublished'} successfully`,
                article
            });
        }

        const validationResult = updateArticleSchema.safeParse({
            ...body,
            id: id
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = validationResult.data;
        const article = await articleService.updateArticle(id, updateData);

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

export async function DELETE(_: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const isOwner = await articleService.verifyOwnership(id, session.user.id);

        if (!isOwner) {
            return NextResponse.json(
                { error: 'Forbidden: You can only delete your own articles' },
                { status: 403 }
            );
        }

        const success = await articleService.deleteArticle(id);

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
