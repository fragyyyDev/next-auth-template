"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            toast.error(data.error || "Registration failed");
        } else {
            toast.success("Registration successful! Redirecting...");
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                    Registrace
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-blue-600 font-medium mb-1">
                            Jméno:
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Vaše jméno"
                            className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-blue-600 font-medium mb-1">
                            Email:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-blue-600 font-medium mb-1">
                            Heslo:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tvé heslo"
                            className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                        Registrovat se
                    </button>
                </form>
            </div>
        </div>
    );
}
