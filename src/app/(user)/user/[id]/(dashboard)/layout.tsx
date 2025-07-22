import Topbar from "@/components/Topbar";
import DashboardSidebar from "../../../../../components/sidebars/DashboardSidebar";
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
        <div className="mt-16">
            <Topbar sidebarId="dashboard-sidebar" />
            <div className="flex">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center p-4 ma">
                    <div className="w-full max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>

    );
}