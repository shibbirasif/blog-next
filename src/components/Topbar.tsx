import NavLinks from "./navigations/NavLinks";
import { auth } from "@/lib/auth";
import SignOut from "./auth/SignOut";
import SignIn from "./auth/SignIn";
import { Avatar, DarkThemeToggle, Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";

export default async function Topbar() {
    const session = await auth();

    return (
        <Navbar fluid rounded className="fixed top-0 w-full z-999 shadow-sm">
            <NavbarBrand href="https://flowbite-react.com">
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Blog Next</span>
            </NavbarBrand>
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
                        <DropdownItem><Link href={`/user/${session.user.id}`}>Dashboard</Link></DropdownItem>
                        <DropdownItem>Settings</DropdownItem>
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