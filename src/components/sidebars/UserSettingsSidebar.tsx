"use client";

import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import { RxAvatar } from "react-icons/rx";
import { TbPasswordUser } from "react-icons/tb";
import { useSession } from 'next-auth/react';
import { APP_ROUTES } from '@/constants/appRoutes';
import { usePathname } from 'next/navigation';

export default function UserSettingsSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <Sidebar id="user-settings-sidebar" aria-label="User settings sidebar" className="w-64 h-[90vh] hidden sm:block absolute sm:relative z-998">
            <SidebarItems>
                <SidebarItemGroup>
                    <SidebarItem
                        href={APP_ROUTES.USER.ABOUT_ME(session?.user?.id)}
                        icon={RxAvatar}
                        active={pathname === APP_ROUTES.USER.ABOUT_ME(session?.user?.id)}
                    >
                        About Me
                    </SidebarItem>
                    <SidebarItem
                        href={APP_ROUTES.USER.CHANGE_PASSWORD(session?.user?.id)}
                        icon={TbPasswordUser}
                        active={pathname === APP_ROUTES.USER.CHANGE_PASSWORD(session?.user?.id)}
                    >
                        Change Password
                    </SidebarItem>
                </SidebarItemGroup>
            </SidebarItems>
        </Sidebar>
    );
}