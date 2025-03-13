"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ENABLE_CREDENTIALS, ENABLE_GOOGLE_OAUTH, ENABLE_REGISTER } from "../../../constants/config";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });
        if (result?.error) {
            setError("Přihlášení se nezdařilo, zkontroluj údaje.");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div>
            {ENABLE_GOOGLE_OAUTH && (
                <p onClick={() => { signIn("google") }}>GOOGLE</p>
            )}
            <h1>Přihlášení</h1>
            {ENABLE_CREDENTIALS && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label>Heslo:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tvé heslo"
                        />
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button type="submit">Přihlásit se</button>
                </form>
            )}
            {ENABLE_REGISTER && (
                <Link href="/register" className="">
                    <p className="text-blue-400">Nemáš účet? Zaregistruj se zde.</p>
                </Link>
            )}
        </div>
    );
}
