import Link from 'next/link';
import { Avatar, Badge, Card } from 'flowbite-react';
import { ArticleListDto } from '@/dtos/ArticleDto';
import { APP_ROUTES } from '@/constants/appRoutes';
import { sanitizeToPlainText } from '@/utils/sanitization';
import LoadMoreClient from './LoadMoreClient';

interface ArticleGridProps {
    articles: ArticleListDto[];
    currentPage: number;
    totalPages: number;
    searchParams?: URLSearchParams;
    className?: string;
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function ArticleGrid({
    articles,
    currentPage,
    totalPages,
    searchParams,
    className = ""
}: ArticleGridProps) {
    const hasMore = currentPage < totalPages;
    const resultsCount = articles.length;

    return (
        <div className={className}>
            {/* Results count */}
            {searchParams && searchParams.toString() && (
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {resultsCount > 0 ? (
                        <>Showing {resultsCount} result{resultsCount !== 1 ? 's' : ''}</>
                    ) : (
                        <>No articles found matching your criteria</>
                    )}
                </div>
            )}

            {articles.length > 0 ? (
                <>
                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {articles.map((article) => (
                            <Link href={APP_ROUTES.ARTICLE.SHOW(article.slug || article._id)} key={article._id}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <article className="flex flex-col h-full">
                                        {/* Article Title */}
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {article.title}
                                        </h2>

                                        {/* Article Content Preview */}
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                            {sanitizeToPlainText(article.content)}
                                        </p>

                                        {/* Author Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar
                                                img={article.author.image || undefined}
                                                size="sm"
                                                rounded
                                                alt={`${article.author.name} avatar`}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {article.author.name}
                                                </p>
                                                <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={new Date(article.createdAt).toISOString()}>
                                                    {formatDate(article.createdAt)}
                                                </time>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2" role="list">
                                                {article.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag._id} color="gray" size="sm" role="listitem">
                                                        <span className="flex items-center gap-1">
                                                            {tag.color && (
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: tag.color }}
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            {tag.name}
                                                        </span>
                                                    </Badge>
                                                ))}
                                                {article.tags.length > 3 && (
                                                    <Badge color="gray" size="sm" role="listitem">
                                                        +{article.tags.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Load More Component */}
                    {hasMore && (
                        <LoadMoreClient
                            currentPage={currentPage}
                            searchParams={searchParams}
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">No articles found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                </div>
            )}
        </div>
    );
}
