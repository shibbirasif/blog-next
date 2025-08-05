import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ArticleListDto } from '@/dtos/ArticleDto';
import { TagDto } from '@/dtos/TagDto';
import { generateHomeMetadata, generateHomeJsonLd } from '@/lib/metadata';
import { ArticleSortOrder } from '@/constants/enums';
import { PAGINATION } from '@/constants/common';
import SearchFilter from '@/components/SearchFilter';
import ArticleGrid from '@/components/ArticleGrid';
import Topbar from '@/components/Topbar';

// Force dynamic rendering for this page since it uses searchParams
export const dynamic = 'force-dynamic';

// SEO Metadata
export const metadata = generateHomeMetadata();

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  try {
    // Await and extract search parameters
    const params = await searchParams;
    const search = typeof params.search === 'string' ? params.search : '';
    const tags = typeof params.tags === 'string' ? params.tags : '';
    const author = typeof params.author === 'string' ? params.author : '';
    const sortBy = typeof params.sortBy === 'string' ? params.sortBy : ArticleSortOrder.NEWEST;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;

    // Build API URL with parameters
    const apiParams = new URLSearchParams();
    apiParams.append('page', page.toString());

    apiParams.append('limit', PAGINATION.ARTICLES_PER_PAGE.toString());
    apiParams.append('sortBy', sortBy);

    if (search) apiParams.append('search', search);
    if (tags) apiParams.append('tags', tags);
    if (author) apiParams.append('author', author);

    // Fetch data in parallel with individual error handling
    const [articlesData, tagsData] = await Promise.allSettled([
      apiFetcher<{ articles: ArticleListDto[]; total: number; pages: number }>(
        `${API_ROUTES.ARTICLE.LIST()}?${apiParams.toString()}`
      ),
      apiFetcher<TagDto[]>(API_ROUTES.TAGS.LIST())
    ]);

    // Handle settled promises with fallbacks
    const finalArticlesData = articlesData.status === 'fulfilled'
      ? articlesData.value
      : { articles: [], total: 0, pages: 1 };

    const finalTags = tagsData.status === 'fulfilled' ? tagsData.value : [];

    // Generate JSON-LD structured data for SEO
    const jsonLd = generateHomeJsonLd(finalArticlesData.articles);

    // Create URLSearchParams for components
    const currentParams = new URLSearchParams();
    if (search) currentParams.set('search', search);
    if (tags) currentParams.set('tags', tags);
    if (author) currentParams.set('author', author);
    if (sortBy && sortBy !== ArticleSortOrder.NEWEST) currentParams.set('sortBy', sortBy);

    return (
      <>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Topbar */}
        <Topbar />

        {/* Hero Section - Server Rendered for SEO */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-6xl font-bold mb-6">Blog Next</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers
            </p>
          </div>
        </div>

        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Search and Filter Section - Client Component */}
            <SearchFilter tags={finalTags} />

            {/* Articles Grid - Server Component */}
            <section aria-labelledby="articles-section">
              <h2 id="articles-section" className="sr-only">
                {search || tags || author ? 'Filtered Articles' : 'Latest Articles'}
              </h2>
              <ArticleGrid
                articles={finalArticlesData.articles}
                currentPage={page}
                totalPages={finalArticlesData.pages}
                searchParams={currentParams}
              />
            </section>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading home page:', error);

    // Fallback UI with Topbar
    return (
      <>
        <Topbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center mt-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog Next</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Unable to load articles at the moment. Please try again later.
            </p>
          </div>
        </div>
      </>
    );
  }
}
