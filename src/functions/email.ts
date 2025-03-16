import nodemailer from "nodemailer";

// Funkce pro odeslání uvítacího e-mailu
export async function sendWelcomeEmail(to: string, userName: string) {
    // Vytvořte Nodemailer transport (příklad s Mailgun SMTP, ale můžete použít jakékoliv SMTP)
    const transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_HOST,
        port: Number(process.env.MAILGUN_SMTP_PORT),
        secure: false, // STARTTLS
        auth: {
            user: process.env.MAILGUN_SMTP_USER,
            pass: process.env.MAILGUN_SMTP_PASSWORD,
        },
    });

    // Nastavení obsahu e-mailu
    const mailOptions = {
        from: `Demo shit <no-reply@${process.env.MAILGUN_DOMAIN}>`,
        to,
        subject: "Vítejte v naší aplikaci!",
        html: `
      <h1>Ahoj, ${userName}!</h1>
      <p>Děkujeme za registraci do naší aplikace. Jsme rádi, že jste se k nám přidali.</p>
      <p>Pokud budete mít jakékoliv dotazy, neváhejte nás kontaktovat.</p>
    `,
    };

    // Odeslání e-mailu
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending welcome email to ${to}:`, error);
    }
}
