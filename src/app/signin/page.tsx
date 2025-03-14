"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ENABLE_CREDENTIALS, ENABLE_GOOGLE_OAUTH, ENABLE_REGISTER } from "../../../constants/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogIn } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

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
            toast.error("Přihlášení se nezdařilo, zkontroluj údaje.");
        } else {
            toast.success("Přihlášení úspěšné, přesměrovávám...");
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Přihlášení</h1>
                {ENABLE_CREDENTIALS && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-blue-600 font-medium mb-1">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-blue-600 font-medium mb-1">Heslo:</label>
                            <PasswordInput value={password} onChange={setPassword} />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
                        >
                            Přihlásit se
                        </button>
                    </form>
                )}
                {ENABLE_GOOGLE_OAUTH && (
                    <>
                        {/* Divider */}
                        {ENABLE_CREDENTIALS && (
                            <div className="flex items-center my-6">
                                <hr className="flex-grow border-t border-blue-200" />
                                <span className="px-2 text-blue-600 font-medium">nebo</span>
                                <hr className="flex-grow border-t border-blue-200" />
                            </div>
                        )}
                        <button
                            onClick={() => signIn("google")}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                        >
                            <LogIn size={20} className="mr-2" />
                            Přihlásit se přes Google
                        </button>
                    </>
                )}
                {ENABLE_REGISTER && (
                    <Link href="/register">
                        <p className="text-blue-400 mt-4 text-center">
                            Nemáš účet? Zaregistruj se zde.
                        </p>
                    </Link>
                )}
                <Link href="/forgot-password">
                    <p className="text-blue-400 mt-4 text-center">
                        Zapomněl jsi heslo?
                    </p>
                </Link>
            </div>
        </div>
    );
}
