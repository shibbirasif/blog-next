import { auth } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await auth();
    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Dashboar Page</h1>
                <p className="text-center text-gray-500">
                    {`${session?.user?.name }'s feed content will be displayed here.`}
                </p>
            </div>
        </main>
    );
}
