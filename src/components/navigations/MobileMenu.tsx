"use client";

import { useEffect, useRef, useState } from "react";
import CloseIcon from "../ui/icons/CloseIcon";
import MenuIcon from "../ui/icons/MenuIcon";
import clsx from "clsx";
import NavLinks from "./NavLinks";

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", onClickOutside);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.body.style.overflow = "";
        };
    }, [isOpen]);



    return (
        <>
            <button onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                className="md:hidden
                    p-2 text-text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent
                    transition-colors duration-200
                    rounded-md"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleMenu} // Allows closing by clicking on overlay
                    aria-hidden={!isOpen}
                ></div>
            )}

            <div id="mobile-menu"
                ref={menuRef}
                className={clsx(
                    "md:hidden fixed top-0 right-0 h-[100vh] justify-start items-start",
                    "w-full sm:w-[250px] md:w-auto",
                    "bg-surface/50 shadow-xl backdrop-blur-md z-50",
                    "flex flex-col",
                    "transition-transform duration-300 ease-in-out",
                    {
                        'translate-x-0': isOpen,       // Menu is open
                        'translate-x-full': !isOpen,   // Menu is hidden (slides off screen)
                    },
                )}
                role="navigation"
                aria-label="Main Navigation (Mobile)"
            >
                <div className="md:hidden w-full flex items-start justify-end h-fit-content p-4">
                    <button
                        onClick={toggleMenu}
                        aria-label="Close menu"
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        className="text-text-secondary hover:text-accent"
                    >
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>

                <NavLinks isMobile={true} />
            </div>
        </>
    );
}
