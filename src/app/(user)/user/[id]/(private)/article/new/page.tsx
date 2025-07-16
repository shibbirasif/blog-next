import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewArticleForm from './NewArticleForm';
import { dbConnect } from '@/lib/db';
import Tag from '@/models/Tag';

interface PageProps {
    params: { id: string };
}

async function getTags() {
    await dbConnect();
    const tags = await Tag.find({ isActive: true })
        .select('_id name color description')
        .sort({ name: 1 });

    return JSON.parse(JSON.stringify(tags));
}

export default async function NewArticlePage({ params }: PageProps) {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
        redirect('/signin');
    }

    // Check if the authenticated user matches the URL parameter
    if (session.user.id !== params.id) {
        redirect('/');
    }

    const tags = await getTags();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create New Article
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Share your thoughts and ideas with the community
                            </p>
                        </div>

                        <div className="p-6">
                            <NewArticleForm
                                userId={session.user.id}
                                availableTags={tags}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
