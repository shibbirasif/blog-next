import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import UserRole from '@/models/UserRole';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from "@/constants/apiRoutes";


export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatar: string;
    roles: UserRole[];
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
                    return await apiFetcher<AuthUser>(API_ROUTES.AUTH.SIGN_IN(true), {
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = (user as AuthUser).name;
                token.avatar = (user as AuthUser).avatar;
                token.roles = (user as AuthUser).roles;
                token.isActive = (user as AuthUser).isActive;
                token.emailVerified = (user as AuthUser).isEmailVerified;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.avatar = session.user.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.avatar = token.avatar as string;
            session.user.roles = token.roles as UserRole[];
            session.user.isActive = token.isActive as boolean;
            session.user.isEmailVerified = token.emailVerified as boolean;
            return session;
        },
    },
    // Optional: Configure pages for redirection
    pages: {
        signIn: '/signin', // custom sign-in page
        error: '/error',   // custom error page (e.g., for login failures)
    },
});

// Extend NextAuth's types for TypeScript for added custom fields to session/JWT
declare module "next-auth" {
    interface Session {
        user: AuthUser
    }

    interface JWT {
        id: string;
        email: string;
        name: string;
        avatar: string;
        roles: UserRole[];
        isActive: boolean;
        isEmailVerified: boolean;
    }
}