import Link from "next/link";
import NavLinks from "./navigations/NavLinks";
import SearchIcon from "./ui/icons/SearchIcon";
import MobileMenu from "./navigations/MobileMenu";

export default function Topbar() {
    return (
        <header className="fixed top-0 left-0 w-full z-30 bg-surface shadow-xs font-semibold text-text-secondary">
            <nav className="flex flex-row justify-between items-center w-[90%] mx-auto sm:max-w-7xl h-16">
                <div>
                    <Link href="/" className="text-2xl font-bold text-primary-dark">
                        Blog Next
                    </Link>
                </div>

                <div className="hidden md:flex">
                    <NavLinks isMobile={false} />
                </div>

                <div className="flex flex-row items-center justify-end gap-3 md:gap-4">
                    <button
                        aria-label="Search"
                        className="p-1 rounded-md text-text-secondary hover:text-accent-secondary transition-colors duration-200"
                    >
                        <SearchIcon />
                    </button>

                    <div>
                        <button className="px-5 mx-2 py-1.5 bg-accent rounded-full hover:bg-secondary hover:text-white duration-300">Sign In</button>
                    </div>
                    <MobileMenu />
                </div>
            </nav>
        </header>
    )
}