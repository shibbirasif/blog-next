import DashboardSidebar from "./DashboardSidebar";
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { id: string };
}

export default async function UserLayout({ children, params }: DashboardLayoutProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/signin');
    }

    const currentUserId = (await params).id;
    if (session.user.id !== currentUserId) {
        redirect('/');
    }

    return (
        <div className="flex">
            <DashboardSidebar />
            {children}
        </div>
    );
}