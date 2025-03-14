"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function DashboardActions() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        toast.success("Odhlášení úspěšné");
        router.push("/signin");
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            "Opravdu chcete odstranit svůj účet? Tato akce je nevratná."
        );
        if (!confirmed) return;

        const response = await fetch("/api/user/delete", {
            method: "POST",
        });

        if (response.ok) {
            toast.success("Účet byl úspěšně odstraněn");
            await signOut({ redirect: false });
            router.push("/register");
        } else {
            toast.error("Nastala chyba při odstraňování účtu");
        }
    };

    return (
        <div className="mt-8 flex space-x-4">
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Odhlásit se
            </button>
            <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Odstranit účet
            </button>
        </div>
    );
}
