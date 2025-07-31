import NavLinks from "./navigations/NavLinks";
import { auth } from "@/lib/auth";
import SignOut from "./auth/SignOut";
import SignIn from "./auth/SignIn";
import { Avatar, DarkThemeToggle, Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Navbar, NavbarBrand, NavbarToggle } from "flowbite-react";
import Link from "next/link";
import Image from "next/image";
import SidebarToggle from "./ui/SidebarToggle";
import { APP_ROUTES } from "@/constants/appRoutes";

interface TopbarProps {
    sidebarId?: string;
}

export default async function Topbar({ sidebarId }: TopbarProps) {
    const session = await auth();

    return (
        <Navbar fluid rounded className="fixed top-0 w-full z-999 shadow-sm">
            <div className="flex">
                {sidebarId && <SidebarToggle sidebarId={sidebarId} />}
                <NavbarBrand href={APP_ROUTES.HOME}>
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/images/logo-no-bg.png"
                            alt="Blog Next Logo"
                            width={32}
                            height={32}
                            className="h-12 w-auto"
                        />
                        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Blog Next</span>
                    </div>
                </NavbarBrand>
            </div>
            <div className="flex md:order-2">
                <DarkThemeToggle className="mx-2" />
                {session?.user ?
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
                        }
                    >
                        <DropdownHeader>
                            <span className="block text-sm">Bonnie Green</span>
                            <span className="block truncate text-sm font-medium">name@flowbite.com</span>
                        </DropdownHeader>
                        <DropdownItem><Link href={APP_ROUTES.USER.FEED(session.user.id)}>Dashboard</Link></DropdownItem>
                        <DropdownItem><Link href={APP_ROUTES.USER.EDIT_PROFILE(session.user.id)}>Settings</Link></DropdownItem>
                        <DropdownDivider />
                        <SignOut>Sign out</SignOut>
                    </Dropdown>
                    : <SignIn>Sign In</SignIn>}
                <NavbarToggle className="mx-2" />
            </div>

            <NavLinks />
        </Navbar>
    )
}