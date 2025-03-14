"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Něco se pokazilo. Zkus to prosím znovu.");
                toast.error(data.message || "Něco se pokazilo. Zkus to prosím znovu.");
            } else {
                toast.success("Pokud je email registrovaný, obdržíte email s instrukcemi.");
                // Můžeš přesměrovat uživatele na jinou stránku nebo nechat zůstat na stránce
                // router.push("/login");
            }
        } catch (err: any) {
            setError("Něco se pokazilo. Zkus to prosím znovu.");
            toast.error("Něco se pokazilo. Zkus to prosím znovu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Reset hesla</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-blue-600 font-medium mb-1" htmlFor="email">
                            Email:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                        {loading ? "Odesílám..." : "Odeslat instrukce"}
                    </button>
                </form>
                <Link href="/signin">
                    <p className="text-blue-400 mt-4 text-center">Zpět na přihlášení</p>
                </Link>
            </div>
        </div>
    );
}
