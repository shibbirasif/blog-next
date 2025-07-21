// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import UserRole from '@/models/UserRole'; // Import UserRole enum for session if needed
import { apiFetcher } from '@/utils/apiFetcher';


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
                    return await apiFetcher<AuthUser>(`${baseUrl}/api/auth/signin`, {
                        method: 'POST',
                        body: { email, password }
                    });
                } catch (error: unknown) {
                    console.error('Signin API error:', error);
                    throw new Error(error instanceof Error ? error.message : 'Authentication failed');
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
            session.user.roles = token.roles as UserRole[];
            session.user.bio = token.bio as string | null;
            session.user.isActive = token.isActive as boolean;
            session.user.isEmailVerified = token.isEmailVerified as boolean;
            return session;
        },
    },
    // Optional: Configure pages for redirection
    pages: {
        signIn: '/signin', // Your custom sign-in page
        error: '/error',   // Your custom error page (e.g., for login failures)
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