"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    // Podmínky pro validaci hesla
    const conditions = useMemo(() => {
        return {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password),
        };
    }, [password]);

    // Počet splněných podmínek
    const conditionsMetCount = Object.values(conditions).filter(Boolean).length;

    // Síla hesla podle počtu splněných podmínek
    const getStrengthLabel = () => {
        switch (conditionsMetCount) {
            case 0:
            case 1:
                return "Slabý";
            case 2:
                return "Nic moc";
            case 3:
                return "Dobrá";
            case 4:
                return "Silný";
            default:
                return "";
        }
    };

    // Určí barvu pro plněné segmenty progress baru podle síly hesla
    const filledColor =
        conditionsMetCount <= 1
            ? "bg-red-500"
            : conditionsMetCount === 2
                ? "bg-orange-500"
                : conditionsMetCount === 3
                    ? "bg-green-300"
                    : conditionsMetCount === 4
                        ? "bg-green-600"
                        : "";

    // Pro finální odeslání formuláře musí být heslo platné (všechny 4 podmínky splněny)
    const isValidPassword = (pass: string) => conditionsMetCount === 4;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidPassword(password)) {
            toast.error("Heslo musí mít alespoň 8 znaků, 1 velké písmeno, 1 číslo a 1 speciální znak.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Hesla se neshodují.");
            return;
        }

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
                        <label className="block text-blue-600 font-medium mb-1">Jméno:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Vaše jméno"
                            className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
                        />
                    </div>
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
                    {/* Interaktivní kontrola podmínek hesla */}
                    {password.length > 0 && (
                        <div className="mb-4">
                            <ul className="text-sm">
                                <li className={conditions.minLength ? "text-green-600" : "text-red-600"}>
                                    {conditions.minLength ? "✓" : "✗"} Alespoň 8 znaků
                                </li>
                                <li className={conditions.hasUpperCase ? "text-green-600" : "text-red-600"}>
                                    {conditions.hasUpperCase ? "✓" : "✗"} Alespoň 1 velké písmeno
                                </li>
                                <li className={conditions.hasNumber ? "text-green-600" : "text-red-600"}>
                                    {conditions.hasNumber ? "✓" : "✗"} Alespoň 1 číslo
                                </li>
                                <li className={conditions.hasSpecialChar ? "text-green-600" : "text-red-600"}>
                                    {conditions.hasSpecialChar ? "✓" : "✗"} Alespoň 1 speciální znak
                                </li>
                            </ul>
                            <div className="mt-2">
                                <div className="flex space-x-1">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-2 w-full ${i < conditionsMetCount ? filledColor : "bg-gray-300"} rounded`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Síla hesla: {getStrengthLabel()}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-blue-600 font-medium mb-1">Potvrď heslo:</label>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Potvrď heslo"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                        Registrovat se
                    </button>
                </form>
                <Link href="/signin">
                    <p className="text-blue-400 mt-4 text-center">
                        Už u nás máš účet? Přihlas se zde.
                    </p>
                </Link>
            </div>
        </div>
    );
}
