import { H1 } from '@/components/ui/Headers';
import { auth } from '@/lib/auth';
import ArticleGrid from '@/components/ArticleGrid';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetcher } from '@/utils/apiFetcher';
import { ArticleListDto } from '@/dtos/ArticleDto';

interface MyArticlesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyArticlesPage({ searchParams }: MyArticlesPageProps) {
    const session = await auth();
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;

    const authorId = session?.user?.id || '';
    const articlesData = await apiFetcher<{ articles: ArticleListDto[]; total: number; pages: number }>(API_ROUTES.ARTICLE.LIST(authorId, true)) ?? { articles: [], total: 0, pages: 1 };

    return (
        <>
            <H1 className='text-center'>My Articles</H1>
            <p className="text-center text-gray-500">
               Displaying all articles by {`${session?.user?.name}`}.
            </p>

            <ArticleGrid
                articles={articlesData.articles}
                currentPage={page}
                totalPages={articlesData.pages}
                className='mt-8'
            />
        </>
    );
}
