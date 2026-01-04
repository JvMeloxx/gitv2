"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { GIFT_TEMPLATES } from "@/lib/templates";
import { EventType } from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession, login, logout } from "@/lib/auth";

// --- Auth Actions ---

export async function registerUser(name: string, email: string, password: string) {
    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "Email já cadastrado." };
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            }
        });

        await login(user.id);
        redirect("/dashboard");
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
        console.error("registerUser error:", error);
        return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
    }
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return { error: "Invalid credentials." };
    }

    await login(user.id);
    redirect("/dashboard");
}

export async function logoutUser() {
    await logout();
    redirect("/login");
}

// --- List Actions ---

export async function createGiftList(formData: {
    eventType: EventType;
    organizerName: string;
    title: string;
    eventDate: string;
    location?: string;
}) {
    try {
        const session = await getSession();
        const userId = session?.userId;

        const { eventType, organizerName, title, eventDate, location } = formData;

        // Generate template items
        const template = GIFT_TEMPLATES[eventType] || GIFT_TEMPLATES.other;
        const initialGifts = template.items.map(item => ({
            name: item.name,
            category: item.category,
            description: item.description,
            quantityNeeded: item.quantityNeeded,
        }));

        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(4)}`;

        const list = await prisma.giftList.create({
            data: {
                slug,
                title,
                organizerName,
                eventType,
                eventDate,
                location,
                userId, // Connect to user if authenticated
                gifts: {
                    create: initialGifts
                }
            }
        });

        redirect(`/dashboard/${list.id}`);
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
        console.error("createGiftList error:", error);
        throw error;
    }
}

export async function addGift(listId: string, data: {
    name: string;
    category: string;
    quantityNeeded: number;
    priceEstimate?: number;
    imageUrl?: string;
    description?: string;
}) {
    await prisma.gift.create({
        data: {
            listId,
            ...data
        }
    });
    revalidatePath(`/dashboard/${listId}`);
}

export async function updateGift(giftId: string, data: {
    name?: string;
    category?: string;
    quantityNeeded?: number;
    priceEstimate?: number;
    imageUrl?: string;
    description?: string;
}) {
    const gift = await prisma.gift.update({
        where: { id: giftId },
        data
    });
    revalidatePath(`/dashboard/${gift.listId}`);
}

export async function deleteGift(giftId: string) {
    const gift = await prisma.gift.delete({
        where: { id: giftId }
    });
    revalidatePath(`/dashboard/${gift.listId}`);
}

export async function selectGift(giftId: string, data: {
    guestName: string;
    guestContact?: string;
    message?: string;
    quantity: number;
}) {
    const gift = await prisma.gift.findUnique({ where: { id: giftId } });
    if (!gift) throw new Error("Gift not found");

    await prisma.selection.create({
        data: {
            giftId,
            ...data
        }
    });

    revalidatePath(`/list/${gift.listId}`);
}
