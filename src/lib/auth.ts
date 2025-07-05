import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Credentials({
        credentials: {
            email: {},
            password: {},
        },
        authorize: async (credentials) => {
            if (
                credentials &&
                typeof credentials.email === "string" &&
                typeof credentials.password === "string"
            ) {
                // Replace this with your actual user lookup and password check
                return { email: credentials.email };
            }
            return null;
        }
    })],
});