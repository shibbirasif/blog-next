"use client";

import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import { FaRss, FaPlus, FaListAlt, FaCog } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { APP_ROUTES } from '@/constants/appRoutes';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <>
            <Sidebar id="dashboard-sidebar" aria-label="User dashboard sidebar" className="w-64 h-[90vh] hidden sm:block absolute sm:relative z-48">
                <SidebarItems>
                    <SidebarItemGroup>
                        <SidebarItem
                            href={APP_ROUTES.USER.FEED(session?.user?.id)}
                            icon={FaRss}
                            active={pathname === APP_ROUTES.USER.FEED(session?.user?.id)}
                        >
                            My Feed
                        </SidebarItem>
                        <SidebarItem
                            href={APP_ROUTES.USER.ARTICLE.NEW(session?.user?.id)}
                            icon={FaPlus}
                            active={pathname === APP_ROUTES.USER.ARTICLE.NEW(session?.user?.id)}
                        >
                            New Article
                        </SidebarItem>
                        <SidebarItem
                            href={APP_ROUTES.USER.MY_ARTICLES(session?.user?.id)}
                            icon={FaListAlt}
                            active={pathname === APP_ROUTES.USER.MY_ARTICLES(session?.user?.id)}
                        >
                            My Articles
                        </SidebarItem>
                        <SidebarItem
                            href={APP_ROUTES.USER.PREFERENCES(session?.user?.id)}
                            icon={FaCog}
                            active={pathname === APP_ROUTES.USER.PREFERENCES(session?.user?.id)}
                        >
                            My Preferences
                        </SidebarItem>
                    </SidebarItemGroup>
                </SidebarItems>
            </Sidebar>
        </>

    );
}