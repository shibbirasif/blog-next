import { H1 } from '@/components/ui/Headers';
import { auth } from '@/lib/auth';

export default async function ChangePasswordPage() {
    const session = await auth();
    return (
        <>
            <H1 className='text-center'>Change Password</H1>
            <p className="text-center text-gray-500">
                {`${session?.user?.name}'s password change form will be displayed here.`}
            </p>
        </>
    );
}
