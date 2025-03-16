import { NextResponse } from "next/server";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { usersTable } from "../../../drizzle/schema";
import { db } from "@/app/drizzle/db";
import { sendWelcomeEmail } from "@/functions/email";

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

        // Zkontrolujeme, zda uživatel již existuje
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

        // Zahashujeme heslo pomocí bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Vložíme nového uživatele do databáze
        const insertedUsers = await db
            .insert(usersTable)
            .values({
                email,
                name,
                password: hashedPassword,
                profilePicture: "",
                courses_owned: [],
                customerId: "",
            })
            .returning();

        // insertedUsers je pole, vezmeme tedy první (a jediný) záznam
        const newUser = insertedUsers[0];

        // Odeslání uvítacího e-mailu
        await sendWelcomeEmail(newUser.email, newUser.name);

        return NextResponse.json(
            { message: "User registered successfully", user: newUser },
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
