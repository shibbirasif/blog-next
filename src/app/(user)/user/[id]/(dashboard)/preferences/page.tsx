import { H1 } from '@/components/ui/Headers';
import { auth } from '@/lib/auth';

export default async function PreferencesPage() {
    const session = await auth();
    return (
        <>
            <H1 className='text-center'>My Preferences</H1>
            <p className="text-center text-gray-500">
                {`${session?.user?.name}'s preferences will be displayed here.`}
            </p>
        </>
    );
}
