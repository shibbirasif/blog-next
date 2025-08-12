'use client';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToastProviderProps {
    children: React.ReactNode;
}
export default function AlertContainer({ children }: ToastProviderProps) {
    return (
        <>
            {children}
            <ToastContainer />
        </>
    );
}
