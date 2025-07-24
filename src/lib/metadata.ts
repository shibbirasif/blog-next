import { Metadata } from 'next';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ArticleDto } from '@/dtos/ArticleDto';
import { ArticleListDto } from '@/dtos/ArticleDto';
import { sanitizeToPlainText } from '@/utils/sanitization';
import { truncateText } from '@/utils/common';

interface ArticleMetadataParams {
    params: Promise<{
        slug: string;
    }>;
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

        const plainTextContent = sanitizeToPlainText(article.content);
        const description = truncateText(plainTextContent, 160);

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

/**
 * Generate metadata for the home page
 * @returns Metadata - The generated metadata for the home page
 */
export const generateHomeMetadata = (): Metadata => {
    return {
        title: 'Blog Next - Discover Amazing Stories',
        description: 'Discover amazing stories, insights, and ideas from our community of writers. Read articles about technology, lifestyle, science, and more.',
        keywords: 'blog, articles, stories, technology, lifestyle, science, community, writers',
        authors: [{ name: 'Blog Next Team' }],
        openGraph: {
            title: 'Blog Next - Discover Amazing Stories',
            description: 'Discover amazing stories, insights, and ideas from our community of writers.',
            type: 'website',
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Blog Next - Discover Amazing Stories',
            description: 'Discover amazing stories, insights, and ideas from our community of writers.',
        },
        alternates: {
            canonical: '/',
        },
    };
};

/**
 * Generate JSON-LD structured data for the home page
 * @param articles - Array of featured articles to include in structured data
 * @returns JSON-LD object for structured data
 */
export function generateHomeJsonLd(articles: ArticleListDto[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Blog Next',
        description: 'Discover amazing stories, insights, and ideas from our community of writers',
        url: process.env.BASE_URL || 'http://localhost:3000',
        publisher: {
            '@type': 'Organization',
            name: 'Blog Next',
        },
        blogPost: articles.slice(0, 3).map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            author: {
                '@type': 'Person',
                name: article.author.name,
            },
            datePublished: article.createdAt,
            dateModified: article.updatedAt,
            url: `${process.env.BASE_URL || 'http://localhost:3000'}/article/${article.slug || article._id}`,
        })),
    };
}
