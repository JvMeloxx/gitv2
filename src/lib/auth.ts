import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret-key-change-me-in-production"; // TODO: Move to env
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1 week") // Session lasts 1 week
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

export async function login(userId: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await encrypt({ userId, expires });

    (await cookies()).set("session", session, { expires, httpOnly: true });
}

export async function logout() {
    (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh session if it exists so it doesn't expire while active
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}
