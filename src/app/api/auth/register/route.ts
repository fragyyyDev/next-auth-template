import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { usersTable } from "../../../drizzle/schema";
import { db } from "@/app/drizzle/db";

config({ path: ".env" });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Kontrola, zda uživatel již existuje
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: "Uživatel již existuje" },
                { status: 400 }
            );
        }

        // Hash hesla s použitím bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // V produkčním prostředí heslo neukládej v plaintextu – zde je uloženo hashované heslo
        const newUser = await db
            .insert(usersTable)
            .values({
                email,
                name,
                password: hashedPassword,
                profilePicture: "", // Obrázek nastavíme jako prázdný string
                courses_owned: [],
                customerId: "",
            })
            .returning();

        return NextResponse.json(
            { message: "User registered successfully", user: newUser[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
