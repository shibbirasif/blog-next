"use client";

import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import { FaRss, FaPlus, FaListAlt, FaCog } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { APP_ROUTES } from '@/constants/appRoutes';

export default function DashboardSidebar() {
    const { data: session } = useSession();


    return (
        <>
            <Sidebar id="dashboard-sidebar" aria-label="User dashboard sidebar" className="w-64 h-[90vh] hidden sm:block absolute sm:relative z-998">
                <SidebarItems>
                    <SidebarItemGroup>
                        <SidebarItem href={APP_ROUTES.USER.FEED(session?.user?.id)} icon={FaRss} active>
                            My Feed
                        </SidebarItem>
                        <SidebarItem href={APP_ROUTES.USER.ARTICLE.NEW(session?.user?.id)} icon={FaPlus}>
                            New Article
                        </SidebarItem>
                        <SidebarItem href="/user/me/articles" icon={FaListAlt}>
                            My Articles
                        </SidebarItem>
                        <SidebarItem href="/preferences" icon={FaCog}>
                            {`${session?.user?.name}'s Preferences`}
                        </SidebarItem>
                    </SidebarItemGroup>
                </SidebarItems>
            </Sidebar>
        </>

    );
}