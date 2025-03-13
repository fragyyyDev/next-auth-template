import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/signin");
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Vítej, {session.user?.name}</p>
            <p>Tvůj email: {session.user?.email}</p>
            {session.user?.image && (
                <Image src={session.user?.image || ''} alt="" width={100} height={100} />
            )}
        </div>
    );
}
