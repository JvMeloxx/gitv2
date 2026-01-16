
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleRedirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

    if (!googleClientId) {
        return NextResponse.json(
            { error: "Google Client ID not found" },
            { status: 500 }
        );
    }

    const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: googleRedirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
}
