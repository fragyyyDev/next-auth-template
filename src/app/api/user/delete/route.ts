import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/app/drizzle/db";
import { eq } from "drizzle-orm";
import { usersTable } from "../../../drizzle/schema";

export async function POST(request: Request) {
    // Získáme session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Smazání uživatele podle jeho id
        await db.delete(usersTable).where(eq(usersTable.id, session.user.id));
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
