import Link from 'next/link';
import Image from 'next/image';
import { DarkThemeToggle } from 'flowbite-react';
import { APP_ROUTES } from '@/constants/appRoutes';

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
            {/* Header with Logo and Theme Toggle */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <Link href={APP_ROUTES.HOME} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <Image
                        src="/images/logo-no-bg.png"
                        alt="Blog Next Logo"
                        width={32}
                        height={32}
                        className="h-12 w-auto"
                    />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Blog Next</span>
                </Link>
                <DarkThemeToggle />
            </div>

            <main>
                <article>{children}</article>
            </main>
        </div>
    );
}