import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TagDto } from '@/dtos/TagDto';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { H1 } from '@/components/ui/Headers';
import NewArticle from '@/components/article/NewArticle';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NewArticlePage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
        redirect('/signin');
    }

    // Check if the user is accessing their own dashboard
    if (session.user.id !== id) {
        redirect('/404');
    }

    try {
        const tags = await apiFetcher<TagDto[]>(API_ROUTES.TAGS.LIST());

        return (
            <>
                <H1 className='text-center'>Start Writing</H1>
                <p className="text-center text-gray-500">
                    Share your thoughts and ideas with the world
                </p>
                <div className="p-6">
                    <NewArticle
                        availableTags={tags}
                        userId={id}
                    />
                </div>
            </>
        );
    } catch (error) {
        console.error('Error fetching tags:', error);
        redirect('/500');
    }
}
