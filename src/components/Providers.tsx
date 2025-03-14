"use client";

import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
    children: React.ReactNode;
    session?: any; // You can import and use the proper Session type from next-auth if desired
}

export function Providers({ children, session }: ProvidersProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}
