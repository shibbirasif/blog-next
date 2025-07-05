import { auth } from "@/lib/auth";

export default async function Nav() {
    const session = await auth();
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">Blog Next</div>

                <ul className="flex space-x-4">
                    <li><a href="/" className="text-white hover:text-gray-300">Home</a></li>
                    <li><a href="/about" className="text-white hover:text-gray-300">About</a></li>
                    <li><a href="/contact" className="text-white hover:text-gray-300">Contact</a></li>
                    {session ? (
                        <>
                            <li><a href="/dashboard" className="text-white hover:text-gray-300">My Account</a></li>
                            <li><a href="/api/auth/logout" className="text-white hover:text-gray-300">Logout</a></li>
                        </>
                    ) : (
                        <li><a href="/sign-in" className="text-white hover:text-gray-300">Login</a></li>
                    )}
                </ul>
            </div>
        </nav>
    );
}