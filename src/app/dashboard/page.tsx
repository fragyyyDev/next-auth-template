"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import DashboardActions from "../../components/DashboardActions";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Still loading, do nothing
        if (!session) {
            router.push("/signin");
        }
    }, [session, status, router]);

    if (status === "loading" || !session) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Dashboard</h1>
            <div className="bg-white shadow p-6 rounded-lg">
                <p className="text-xl mb-2">
                    Vítej, <span className="font-semibold">{session.user?.name}</span>
                </p>
                <p className="text-lg mb-4">
                    Tvůj email: <span className="font-semibold">{session.user?.email}</span>
                </p>
                {session.user?.image && (
                    <div className="mb-4">
                        <Image
                            className="rounded-full"
                            src={session.user.image}
                            alt="User image"
                            width={100}
                            height={100}
                        />
                    </div>
                )}
                <DashboardActions />
            </div>
        </div>
    );
}
