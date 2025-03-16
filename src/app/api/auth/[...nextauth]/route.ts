export const dynamic = 'force-dynamic';
export const revalidate = 0;

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { usersTable } from "../../../drizzle/schema";
import { db } from "@/app/drizzle/db";
import { ENABLE_CREDENTIALS, ENABLE_GOOGLE_OAUTH } from "../../../../../constants/config";
import { sendWelcomeEmail } from "@/functions/email";

config({ path: ".env" });

// Build the providers array based on your configuration flags
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

                // Najdi uživatele dle emailu v databázi
                const users = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, credentials.email))
                    .limit(1);

                if (users.length === 0) {
                    // Uživatel neexistuje, vytvoř ho
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);

                    const insertedUsers = await db
                        .insert(usersTable)
                        .values({
                            name: credentials.email.split("@")[0],
                            email: credentials.email,
                            password: hashedPassword,
                            profilePicture: "",  // podle schématu
                            courses_owned: [],    // podle schématu
                            customerId: "",       // podle schématu
                        })
                        .returning();

                    console.log("Inserted Users:", insertedUsers);

                    if (insertedUsers.length === 0) {
                        return null;
                    }


                    const newUser = insertedUsers[0];



                    return {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        image: newUser.profilePicture || null,
                    };
                }

                const user = users[0];

                // Porovnej heslo s hashovanou verzí
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.profilePicture || null,
                };
            },
        })
    );
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: providers,
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                // Uživatel se přihlašoval přes Google
                if (account?.provider === "google" && user.email) {
                    // Načteme uživatele z databáze pomocí emailu
                    const dbUser = await db
                        .select()
                        .from(usersTable)
                        .where(eq(usersTable.email, user.email))
                        .limit(1);

                    if (dbUser.length > 0) {
                        token.id = dbUser[0].id; // zde se uloží správný UUID
                    } else {
                        token.id = user.id;
                    }
                } else {
                    token.id = user.id;
                }
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
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                // Ověření, že user.email je definován
                if (!user.email) {
                    console.error("Google OAuth: chybí email");
                    return false;
                }
                // Zkontroluj, zda uživatel již existuje v databázi
                const existingUsers = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, user.email))
                    .limit(1);

                if (existingUsers.length === 0) {
                    // Uživatel ještě neexistuje – vytvoř ho
                    const insertedUsers = await db
                        .insert(usersTable)
                        .values({
                            name: user.name || (user.email ? user.email.split("@")[0] : "unknown"),
                            email: user.email,
                            password: "",  // Google auth nepoužívá heslo
                            profilePicture: user.image || "",
                            courses_owned: [],
                            customerId: "",
                        })
                        .returning();

                    console.log("Created new Google user:", insertedUsers);
                    const newUser = insertedUsers[0];
                    if (insertedUsers.length > 0) {
                        await sendWelcomeEmail(newUser.email, newUser.name);
                    }
                }
            }
            return true;
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
