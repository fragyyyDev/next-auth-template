"use client";

import PasswordInput from "@/components/PasswordInput";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            console.error("Token or email is missing");
            toast.error("Chybí token nebo email.");
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Implementace API callu pro reset hesla (např. /api/auth/reset-password)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || "Chyba při resetu hesla.");
            } else {
                toast.success("Heslo bylo úspěšně resetováno.");
                // Přesměrování na přihlašovací stránku nebo jinou stránku
                const router = useRouter();
                router.push("/login");
            }
        } catch (error) {
            toast.error("Chyba při odesílání požadavku.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                    Zvolte si nove heslo
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-blue-600 font-medium mb-1">
                            Nové heslo:
                        </label>
                        <PasswordInput value={password} onChange={setPassword}/>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                        {loading ? "Resetování..." : "Resetovat heslo"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
