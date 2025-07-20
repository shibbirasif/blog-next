import { Metadata } from 'next';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ArticleDto } from '@/dtos/ArticleDto';
import { sanitizeToPlainText } from '@/utils/sanitization';
import { truncateText } from '@/utils/common';

interface ArticleMetadataParams {
    params: {
        slug: string;
    };
}

/**
 * Generate metadata for article pages
 * @param params - Page parameters containing the article slug
 * @returns Promise<Metadata> - The generated metadata for the article
 */
export async function generateArticleMetadata({ params }: ArticleMetadataParams): Promise<Metadata> {
    try {
        const { slug } = await params;
        const data = await apiFetcher<{ article: ArticleDto }>(API_ROUTES.ARTICLE.SHOW(slug, true));
        const article = data.article;

        if (!article) {
            return {
                title: 'Article Not Found',
                description: 'The requested article could not be found.'
            };
        }

        // Strip HTML and create description
        const plainTextContent = sanitizeToPlainText(article.content);
        const description = truncateText(plainTextContent, 160);

        // Create keywords from tags
        const keywords = article.tags?.map(tag => tag.name).join(', ') || '';

        return {
            title: `${article.title} | Blog Next`,
            description,
            keywords,
            authors: [{ name: article.author.name }],
            openGraph: {
                title: article.title,
                description,
                type: 'article',
                publishedTime: new Date(article.createdAt).toISOString(),
                modifiedTime: new Date(article.updatedAt).toISOString(),
                authors: [article.author.name],
                tags: article.tags?.map(tag => tag.name),
            },
            twitter: {
                card: 'summary_large_image',
                title: article.title,
                description,
                creator: `@${article.author.name.replace(/\s+/g, '').toLowerCase()}`,
            },
            robots: {
                index: article.isPublished,
                follow: article.isPublished,
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Article | Blog Next',
            description: 'Read the latest articles on Blog Next'
        };
    }
}

/**
 * Generate JSON-LD structured data for an article
 * @param article - The article data
 * @returns JSON-LD object for structured data
 */
export function generateArticleJsonLd(article: ArticleDto) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": truncateText(sanitizeToPlainText(article.content), 160),
        "author": {
            "@type": "Person",
            "name": article.author.name,
            ...(article.author.bio && { "description": article.author.bio })
        },
        "datePublished": new Date(article.createdAt).toISOString(),
        "dateModified": new Date(article.updatedAt).toISOString(),
        ...(article.tags && article.tags.length > 0 && {
            "keywords": article.tags.map(tag => tag.name)
        }),
        "publisher": {
            "@type": "Organization",
            "name": "Blog Next",
            "url": process.env.BASE_URL || "http://localhost:3000"
        }
    };
}
