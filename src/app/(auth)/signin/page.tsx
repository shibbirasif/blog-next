import { signIn } from "@/lib/auth";
import { sign } from "crypto";

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            <form action={async (formData: FormData) => {
                'use server';
                await signIn("credentials", {
                    email: formData.get("email") as string,
                    password: formData.get("password") as string,
                });
            }} className="bg-surface p-6 rounded shadow-md w-full max-w-sm">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-md font-medium text-text-primary">Email</label>
                    <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md" />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-md font-medium text-text-primary">Password</label>
                    <input type="password" id="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition duration-200">Sign In</button>
            </form>
        </div>
    );
}