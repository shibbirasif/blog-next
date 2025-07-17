import { ReactNode } from "react";

interface HeaderProps {
    children: ReactNode;
    className?: string;
}
export function H1({ children, className = '' }: HeaderProps) {

    return (
        <h1 className={`text-2xl font-bold mb-1 text-gray-700 dark:text-gray-400 ${className}`}>
            {children}
        </h1>
    );
}
