import { NavbarCollapse, NavbarLink } from "flowbite-react";
import { headers } from "next/headers";

interface NavItem {
    name: string;
    href: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Art & Design', href: '/art-design' },
    { name: 'Beauty', href: '/beauty' },
    { name: 'Lifestyle', href: '/lifestyle' },
    { name: 'More', href: '/more' },
];

interface NavLinksProps {
    isMobile?: boolean;
}

export default function NavLinks({ isMobile = false }: NavLinksProps) {
    const isActive = async (href: string): Promise<boolean> => {
        const headerList = await headers();
        const currentPath = headerList.get('x-request-path');
        return href === currentPath;
    }
    return (
        <NavbarCollapse>
            {MAIN_NAV_ITEMS.map(async (item) => (
                <NavbarLink href={item.href} active={await isActive(item.href)}>
                    {item.name}
                </NavbarLink>
            ))}

        </NavbarCollapse>
    );
}