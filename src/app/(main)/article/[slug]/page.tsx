import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { H1 } from '@/components/ui/Headers';
import { Avatar, Badge } from 'flowbite-react';
import { HiOutlineCalendar, HiOutlineEye } from 'react-icons/hi';
import EditEditButton from '../../../../components/article/EditArticleButton';
import { ArticleDto } from '@/dtos/ArticleDto';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { generateArticleMetadata, generateArticleJsonLd } from '@/lib/metadata';
import { TagDto } from '@/dtos/TagDto';

interface PageProps {
    params: {
        slug: string;
    };
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Export the metadata generation function
export const generateMetadata = generateArticleMetadata;

export default async function ArticleDetailsPage({ params }: PageProps) {
    const session = await auth();
    const { slug } = await params;

    try {
        const data = await apiFetcher<{ article: ArticleDto }>(API_ROUTES.ARTICLE.SHOW(slug, true));

        const article: ArticleDto = data.article;

        if (!article) {
            notFound();
        }

        const author = article.author;
        const isAuthor = session?.user?.id === author._id.toString();

        // JSON-LD structured data for SEO
        const jsonLd = generateArticleJsonLd(article);

        const getStatusBadge = () => {
            if (article.isPublished) {
                return (
                    <Badge color="success" className="w-fit">
                        <div className="flex items-center gap-1">
                            <HiOutlineEye className="w-3 h-3" />
                            <span>Published</span>
                        </div>
                    </Badge>
                );
            } else {
                return (
                    <Badge color="warning" className="w-fit">
                        Draft
                    </Badge>
                );
            }
        };

        return (
            <>
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Article Header */}
                    <div className="mb-6">
                        {/* Article Title - Full Width */}
                        <div className="mb-4">
                            <H1 className='text-center'>{article.title}</H1>
                        </div>

                        {/* Article Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <div className="flex items-center gap-2">
                                <Avatar
                                    img={author.avatar || undefined}
                                    size="xs"
                                    rounded
                                />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {author.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <HiOutlineCalendar className="w-4 h-4" />
                                <span>{formatDate(article.createdAt)}</span>
                            </div>

                            {article.updatedAt !== article.createdAt && (
                                <div className="text-xs">
                                    Updated: {formatDate(article.updatedAt)}
                                </div>
                            )}

                            {getStatusBadge()}
                            {isAuthor && (
                                <EditEditButton
                                    authorId={author._id}
                                    articleId={article._id}
                                />
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {article.tags.map((tag: TagDto) => (
                                    <Badge
                                        key={tag._id}
                                        color="gray"
                                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            {tag.name}
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <div
                            dangerouslySetInnerHTML={{ __html: article.content }}
                            className="break-words"
                        />
                    </div>
                </div>
            </>
        );
    } catch (error) {
        console.error('Error fetching article:', error);

        // Handle specific error cases
        if (error instanceof Error && error.message.includes('404')) {
            notFound();
        }

        // For other errors, still show not found
        notFound();
    }
}