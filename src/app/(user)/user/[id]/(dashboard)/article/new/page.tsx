import { auth } from '@/lib/auth';
import NewArticleForm from './NewArticleForm';
import { apiFetcher } from '@/utils/apiFetcher';
import { TagDto } from '@/dtos/TagDto';
import { H1 } from '@/components/ui/Headers';

interface PageProps {
    params: { id: string };
}

export default async function NewArticlePage({ params }: PageProps) {
    const session = await auth();

    const tags = await apiFetcher<TagDto[]>(`${process.env.BASE_URL}/api/tags`);

    return (
        <>
            <H1 className='text-center'>Start Writing</H1>
            <p className="text-center text-gray-500">
                Share your thoughts and ideas with the world
            </p>
            <div className="p-6">
                <NewArticleForm
                    userId={session?.user?.id || '0'}
                    availableTags={tags}
                />
            </div>
        </>

    );
}
