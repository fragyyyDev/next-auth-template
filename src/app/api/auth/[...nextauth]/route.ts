export const dynamic = 'force-dynamic';
export const revalidate = 0;

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { usersTable } from "../../../drizzle/schema";
import { db } from "@/app/drizzle/db";
import { ENABLE_CREDENTIALS, ENABLE_GOOGLE_OAUTH } from "../../../../../constants/config";

config({ path: ".env" });
// Sestavení pole providerů na základě konstant
const providers = [];

if (ENABLE_GOOGLE_OAUTH) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    );
}

if (ENABLE_CREDENTIALS) {
    providers.push(
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@example.com" },
                password: { label: "Heslo", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Vyhledání uživatele v databázi podle emailu
                const users = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, credentials.email))
                    .limit(1);

                if (users.length === 0) {
                    return null;
                }
                const user = users[0];

                // Kontrola hesla – v produkci použij hashování!
                if (user.password !== credentials.password) {
                    return null;
                }

                // Vrátíme objekt uživatele; image nastavíme jako null
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: null,
                };
            },
        })
    );
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: providers,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: typeof token.id === "string" ? token.id : "",
                name: token.name ? (token.name as string) : "",
                email: token.email ? (token.email as string) : "",
                image: token.image ? (token.image as string) : null,
            };
            return session;
        },
        async redirect({ baseUrl }) {
            return `${baseUrl}/dashboard`;
        },
    },
    pages: {
        signIn: "/signin",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
