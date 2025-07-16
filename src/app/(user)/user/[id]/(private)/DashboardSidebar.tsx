'use client';

import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import { FaRss, FaPlus, FaListAlt, FaCog } from 'react-icons/fa';

export default function DashboardSidebar() {
    return (
        <Sidebar aria-label="User dashboard sidebar" className="w-64 h-[100vh] hidden sm:block">
            <SidebarItems>
                <SidebarItemGroup>
                    <SidebarItem href="/feeds" icon={FaRss} active>
                        My Feeds
                    </SidebarItem>
                    <SidebarItem href="/user/me/article/new" icon={FaPlus}>
                        New Article
                    </SidebarItem>
                    <SidebarItem href="/user/me/articles" icon={FaListAlt}>
                        My Articles
                    </SidebarItem>
                    <SidebarItem href="/preferences" icon={FaCog}>
                        Preferences
                    </SidebarItem>
                </SidebarItemGroup>
            </SidebarItems>
        </Sidebar>
    );
}