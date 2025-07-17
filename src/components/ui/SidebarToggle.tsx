'use client';

import { useState } from "react";
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarLeftCollapse } from "react-icons/tb";

interface SidebarToggleProps {
    sidebarId: string;
}

export default function SidebarToggle({ sidebarId }: SidebarToggleProps) {
    // Local state to manage the
    const [collapsed, toggleCollapse] = useState(false);

    const handleToggle = () => {
        const sidebar = document.getElementById(sidebarId);
        if (sidebar) {
            sidebar.classList.toggle('hidden');
            toggleCollapse(!collapsed);
        }
    };


    return (
        <button className="mr-2 items-center rounded-lg p-1 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            {collapsed ?
                <TbLayoutSidebarLeftExpand size="2.5em" onClick={handleToggle} /> :
                <TbLayoutSidebarLeftCollapse size="2.5em" onClick={handleToggle} />
            }
        </button>
    );
}