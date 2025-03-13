import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    interface JWT {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}
