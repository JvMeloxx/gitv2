
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { login } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

    if (!code || !googleClientId || !googleClientSecret) {
        return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: googleClientId,
                client_secret: googleClientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            throw new Error("Failed to retrieve access token");
        }

        // Get user info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const userData = await userResponse.json();

        let user = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (!user) {
            // Create new user if not exists
            user = await prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name || userData.email.split("@")[0],
                    // No password for Google users
                },
            });
        }

        // Log the user in
        await login(user.id);

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("Google Auth Error:", error);
        return NextResponse.redirect(new URL("/login?error=google_auth_error", request.url));
    }
}
