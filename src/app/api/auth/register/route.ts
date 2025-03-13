import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { usersTable } from "../../../drizzle/schema";
import { db } from "@/app/drizzle/db";

config({ path: ".env" });


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Kontrola, zda uživatel již existuje
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // V produkčním prostředí heslo neukládej v plaintextu – použij hashování!
        const newUser = await db.insert(usersTable).values({
            email,
            name,
            password, // Heslo ukládej bezpečně
            profilePicture: "", // Obrázek nastavíme jako prázdný string
            courses_owned: [],
            customerId: "",
        }).returning();

        return NextResponse.json({ message: "User registered successfully", user: newUser[0] });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
