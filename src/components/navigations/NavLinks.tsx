import Link from "next/link";

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
    return (
        <ul className={`
                        flex ${isMobile ? 'flex-col justify-start items-start' : 'flex-row justify-center items-center md:gap-8'}
                        w-full
                    `}>

            {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.name} className={`${isMobile ? 'h-[50px] w-full' : 'h-auto w-auto'}`}>
                    <Link href={item.href}
                        className={`
                                    h-full w-full flex items-center
                                    ${isMobile ? 'justify-start px-4' : 'justify-center'}
                                    hover:text-accent-secondary
                                `}>
                        {item.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}