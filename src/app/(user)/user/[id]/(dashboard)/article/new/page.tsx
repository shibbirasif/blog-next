import NewArticleForm from './NewArticleForm';
import { apiFetcher } from '@/utils/apiFetcher';
import { TagDto } from '@/dtos/TagDto';
import { H1 } from '@/components/ui/Headers';
import { API_ROUTES } from '@/constants/apiRoutes';

interface PageProps {
    params: { id: string };
}

export default async function NewArticlePage({ params }: PageProps) {

    const tags = await apiFetcher<TagDto[]>(API_ROUTES.TAGS.LIST(true));

    return (
        <>
            <H1 className='text-center'>Start Writing</H1>
            <p className="text-center text-gray-500">
                Share your thoughts and ideas with the world
            </p>
            <div className="p-6">
                <NewArticleForm
                    userId={params.id || '0'}
                    availableTags={tags}
                />
            </div>
        </>

    );
}
