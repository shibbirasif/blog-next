"use client";

import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import { FaRss, FaPlus, FaListAlt, FaCog } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function DashboardSidebar() {
    const { data: session } = useSession();


    return (
        <>
            <Sidebar id="dashboard-sidebar" aria-label="User dashboard sidebar" className="w-64 h-[90vh] hidden sm:block absolute">
                <SidebarItems>
                    <SidebarItemGroup>
                        <SidebarItem href="/feeds" icon={FaRss} active>
                            My Feeds
                        </SidebarItem>
                        <SidebarItem href={`/user/${session?.user?.id}/article/new`} icon={FaPlus}>
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