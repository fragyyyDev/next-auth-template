import { NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { usersTable } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    const body = await request.json();
    const { token, email, password } = body
    if (!token || !email || !password) {
        return NextResponse.json(
            { message: "Token, email a heslo jsou povinné." },
            { status: 400 }
        );
    }

    // Najdeme uživatele dle email
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1).execute();

    if (!user) {
        return NextResponse.json(
            { message: "Uživatel nenalezen." },
            { status: 404 }
        );
    }
    // Zkontrolujeme, zda je token platný
    if (!user[0].resetToken) {
        return NextResponse.json(
            { message: "Neplatný token." },
            { status: 400 }
        );
    }

    const isTokenValid = await bcrypt.compare(token, user[0].resetToken);
    if (!isTokenValid) {
        return NextResponse.json(
            { message: "Neplatný token." },
            { status: 400 }
        );
    }
    // Zkontrolujeme expiraci tokenu
    const now = new Date();
    if (user[0].resetTokenExpiry && user[0].resetTokenExpiry < now) {
        return NextResponse.json(
            { message: "Token vypršel." },
            { status: 400 }
        );
    }
    // Hashujeme nové heslo
    const hashedPassword = await bcrypt.hash(password, 10);
    // Uložíme nové heslo a vymažeme token a expiraci
    
    await db.update(usersTable)
        .set({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        })
        .where(eq(usersTable.email, email));

    // Odpovíme úspěšně
    return NextResponse.json(
        { message: "Heslo bylo úspěšně resetováno." },
        { status: 200 } 
    );
}