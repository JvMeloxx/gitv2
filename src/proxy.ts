import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    await updateSession(request);

    const currentUser = request.cookies.get("session")?.value;
    const path = request.nextUrl.pathname;

    // Protected routes
    if (path.startsWith("/dashboard") && !currentUser) {
        // If it's a specific dashboard ID (e.g. /dashboard/uuid), checking ownership is harder in middleware without DB.
        // For now, let's just Require Login for ANY dashboard access to enforce the account system.
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect authenticated users away from auth pages
    if ((path === "/login" || path === "/register") && currentUser) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
