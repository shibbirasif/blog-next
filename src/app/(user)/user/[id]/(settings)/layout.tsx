import Topbar from "@/components/Topbar";
import UserSettingsSidebar from "@/components/sidebars/UserSettingsSidebar";
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface UserSettingsLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function UserSettingsLayout({ children, params }: UserSettingsLayoutProps) {
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
            <Topbar sidebarId="user-settings-sidebar" />
            <div className="flex">
                <UserSettingsSidebar />
                <main className="flex-1 flex items-center justify-center p-4 ma">
                    <div className="w-full max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>

    );
}