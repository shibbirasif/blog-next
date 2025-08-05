import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetcher } from '@/utils/apiFetcher';
import { TagDto } from '@/dtos/TagDto';
import { ArticleDto } from '@/dtos/ArticleDto';
import { H1 } from '@/components/ui/Headers';
import { API_ROUTES } from '@/constants/apiRoutes';
import EditArticle from '../../../../../../../../components/article/EditArticle';

interface PageProps {
    params: Promise<{ id: string; articleId: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
    const session = await auth();
    const { id, articleId } = await params;

    if (!session?.user) {
        redirect('/signin');
    }

    try {
        // Fetch the article to edit and tags in parallel
        const [articleResponse, tags] = await Promise.all([
            apiFetcher<{ article: ArticleDto }>(API_ROUTES.ARTICLE.SHOW(articleId)),
            apiFetcher<TagDto[]>(API_ROUTES.TAGS.LIST())
        ]);

        const article = articleResponse.article;
        console.log('Editing article:', article);

        if (!article) {
            redirect('/404');
        }

        // Check if the user is the author of the article
        if (article.author.id !== session.user.id) {
            redirect('/404');
        }

        return (
            <>
                <H1 className="text-center">Edit Article</H1>
                <p className="text-center text-gray-500 mb-6">
                    Update your thoughts and ideas
                </p>
                <div className="p-6">
                    <EditArticle
                        article={article}
                        availableTags={tags}
                        userId={id}
                    />
                </div>
            </>
        );
    } catch (error) {
        console.error('Error fetching article for edit:', error);
        redirect('/404');
    }
}