import { auth } from "@/lib/auth";
import SignOut from "./auth/SignOut";
import SignIn from "./auth/SignIn";
import { Avatar, Button, DarkThemeToggle, Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Navbar, NavbarBrand } from "flowbite-react";
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
        <Navbar fluid rounded className="fixed top-0 w-full z-49 shadow-sm">
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
                {session?.user &&
                    <Button href={APP_ROUTES.USER.ARTICLE.NEW(session.user.id)} color="pink">
                        New Article
                    </Button>
                }
                <DarkThemeToggle className="mx-2 cursor-pointer" />
                {session?.user ?
                    <Dropdown
                        arrowIcon={false}
                        inline
                        className="w-[200px]"
                        label={
                            session?.user?.avatar && session.user.avatar !== '' ?
                                <Avatar alt="User settings" img={session.user.avatar} rounded className="cursor-pointer" />
                                :
                                <Avatar placeholderInitials={session?.user ? session.user.name[0].toUpperCase() : "U"} rounded className="cursor-pointer" />

                        }
                    >
                        <DropdownHeader>
                            <span className="block text-xl">{session.user.name}</span>
                            <span className="block truncate text-sm font-medium">{session.user.email}</span>
                        </DropdownHeader>
                        <DropdownDivider />
                        <DropdownItem><Link href={APP_ROUTES.USER.FEED(session.user.id)}>Dashboard</Link></DropdownItem>
                        <DropdownItem><Link href={APP_ROUTES.USER.PROFILE_EDIT(session.user.id)}>Settings</Link></DropdownItem>
                        <DropdownDivider />
                        <SignOut>Sign out</SignOut>
                    </Dropdown>
                    : <SignIn>Sign In</SignIn>}
                {/* <NavbarToggle className="mx-2" /> //Removing for now, we will add it back later\\ */}
            </div>

            {/* <NavLinks /> //Removing for now, we will add it back later\\*/}
        </Navbar>
    )
}