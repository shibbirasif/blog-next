import { H1 } from '@/components/ui/Headers';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await auth();
    return (
        <>
            <H1 className='text-center'>Dashboar Page</H1>
            <p className="text-center text-gray-500">
                {`${session?.user?.name}'s feed content will be displayed here.`}
            </p>
        </>
    );
}
