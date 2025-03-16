// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { usersTable } from "../../../drizzle/schema";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    const body = await request.json();
    const { email } = body;

    if (!email) {
        return NextResponse.json(
            { message: "Email je povinný." },
            { status: 400 }
        );
    }

    // Find user by email
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

    // Respond the same way even if user does not exist
    if (!user) {
        return NextResponse.json({
            message: "Pokud je email registrovaný, obdržíte email s instrukcemi.",
        });
    }

    // Generate a reset token and set expiration (e.g., 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000);
    const hashedToken = await bcrypt.hash(token, 10);

    // Save the hashed token and expiry to the database
    await db
        .update(usersTable)
        .set({ resetToken: hashedToken, resetTokenExpiry: expiry })
        .where(eq(usersTable.email, email));

    // Set up Nodemailer transport using Mailgun's SMTP settings from .env
    const transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_HOST,
        port: Number(process.env.MAILGUN_SMTP_PORT),
        secure: false, // use STARTTLS
        auth: {
            user: process.env.MAILGUN_SMTP_USER,
            pass: process.env.MAILGUN_SMTP_PASSWORD,
        },
    });


    // Prepare reset URL (includes the original token, which will be sent via email)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Prepare the email data
    const mailOptions = {
        from: `Your Name <no-reply@${process.env.MAILGUN_DOMAIN}>`,
        to: email,
        subject: "Reset hesla",
        html: `<p>Klikněte na <a href="${resetUrl}">tento odkaz</a> pro resetování hesla. Odkaz je platný 1 hodinu.</p>`,
    };

    try {
        // Send the email using Nodemailer
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent response:", info);
        return NextResponse.json({ message: "Email byl odeslán." });
    } catch (error) {
        console.error("Email send error:", error);
        return NextResponse.json(
            { message: "Nepodařilo se odeslat email." },
            { status: 500 }
        );
    }
}
