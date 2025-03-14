// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from "../../../drizzle/db";
import { usersTable } from "../../../drizzle/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Pouze POST requesty jsou povoleny.' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email je povinný.' });
    }

    // Najdeme uživatele dle emailu
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    // Pokud uživatel neexistuje, odpovíme stejným způsobem, aby nebylo možné zjistit, zda email existuje
    if (!user) {
        return res.status(200).json({ message: 'Pokud je email registrovaný, obdržíte email s instrukcemi.' });
    }

    // Vygenerujeme token a nastavíme expiraci (např. 1 hodina)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600 * 1000);

    // Hashujeme token pomocí bcrypt (salt rounds = 10)
    const hashedToken = await bcrypt.hash(token, 10);

    // Uložíme hashed token a expiraci do databáze
    await db.update(usersTable)
        .set({ resetToken: hashedToken, resetTokenExpiry: expiry })
        .where(eq(usersTable.email, email));

    // Připravíme konfiguraci pro odesílání emailů
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    // URL pro reset hesla – předáme původní token, který uživatel obdrží emailem
    const resetUrl = `${process.env.NEXTAUTH_URL}/api/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
        to: email,
        subject: 'Reset hesla',
        html: `<p>Klikněte na <a href="${resetUrl}">tento odkaz</a> pro resetování hesla. Odkaz je platný 1 hodinu.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email byl odeslán.' });
    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ message: 'Nepodařilo se odeslat email.' });
    }
}
