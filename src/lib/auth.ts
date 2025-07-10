// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import UserRole from '@/models/UserRole'; // Import UserRole enum for session if needed


export interface AuthUser {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    roles: UserRole[];
    bio?: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {

                const email = credentials.email as string | undefined;
                const password = credentials.password as string | undefined;

                if (!email || !password) {
                    throw new Error("Missing credentials");
                }

                try {
                    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
                    const res = await fetch(`${baseUrl}/api/auth/signin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        console.error('Signin API error:', errorData);
                        throw new Error(errorData.message || 'Authentication failed');
                    }

                    return (await res.json()) as AuthUser;
                } catch (error: any) {
                    console.error('NextAuth authorize error:', error.message);
                    throw new Error("Authentication failed: " + error.message);
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
                token.roles = (user as AuthUser).roles;
                token.bio = (user as AuthUser).bio;
                token.isActive = (user as AuthUser).isActive;
                token.isEmailVerified = (user as AuthUser).isEmailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            // Add custom data from JWT to session
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.image = token.picture as string | null | undefined;
            (session.user as any).roles = token.roles; // Add roles to session.user
            (session.user as any).bio = token.bio;
            (session.user as any).isActive = token.isActive;
            (session.user as any).isEmailVerified = token.isEmailVerified;
            return session;
        },
    },
    // Optional: Configure pages for redirection
    pages: {
        signIn: '/auth/signin', // Your custom sign-in page
        error: '/auth/error',   // Your custom error page (e.g., for login failures)
    },
});

// Extend NextAuth's types for TypeScript if you added custom fields to session/JWT
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            roles: UserRole[];
            bio?: string | null;
            isActive: boolean;
            isEmailVerified: boolean;
        };
    }
    interface JWT {
        id: string;
        roles: UserRole[];
        bio?: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
    }
}