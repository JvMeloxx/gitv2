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
            },
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
    try {
        console.log("DEBUG: loginUser started", { email });
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            console.log("DEBUG: Invalid credentials", { email });
            return { error: "Credenciais inválidas." };
        }

        console.log("DEBUG: loginUser success, starting session", { userId: user.id });
        await login(user.id);
        console.log("DEBUG: loginUser redirecting to dashboard");
        redirect("/dashboard");
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
        console.error("DEBUG: loginUser error:", error);
        return { error: "Erro ao entrar. Verifique sua conexão ou tente novamente mais tarde." };
    }
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
    coverImageUrl?: string;
    theme?: string;
    backgroundImageUrl?: string;
    organizerPhone?: string;
    organizerEmail?: string;
    selectedGifts?: {
        name: string;
        category: string;
        description?: string;
        quantityNeeded: number;
        imageUrl?: string;
    }[];
}) {
    try {
        const session = await getSession();
        const userId = session?.userId;

        const {
            eventType,
            organizerName,
            title,
            eventDate,
            location,
            coverImageUrl,
            theme,
            backgroundImageUrl,
            organizerPhone,
            organizerEmail,
            selectedGifts
        } = formData;

        // Use selected gifts if provided, otherwise fallback to template logic or empty
        let initialGiftsData: any[] = [];
        if (selectedGifts && selectedGifts.length > 0) {
            initialGiftsData = selectedGifts;
        } else if (eventType !== 'other') {
            const template = GIFT_TEMPLATES[eventType] || GIFT_TEMPLATES.other;
            initialGiftsData = template.items.map(item => ({
                name: item.name,
                category: item.category,
                description: item.description,
                quantityNeeded: item.quantityNeeded,
                imageUrl: item.imageUrl,
            }));
        }

        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(4)}`;

        const list = await prisma.giftList.create({
            data: {
                slug,
                title,
                organizerName,
                eventType,
                eventDate,
                location,
                organizerPhone,
                organizerEmail,
                coverImageUrl,
                theme: theme || "default",
                backgroundImageUrl,
                userId, // Connect to user if authenticated
                gifts: {
                    create: initialGiftsData
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
    try {
        console.log("DEBUG: selectGift started", { giftId, data });
        const gift = await prisma.gift.findUnique({
            where: { id: giftId },
            include: { list: { include: { user: true } } }
        });
        if (!gift) throw new Error("Gift not found");

        const selection = await prisma.selection.create({
            data: {
                giftId,
                ...data
            }
        });

        // Send notifications
        const organizerEmail = (gift.list as any).organizerEmail || gift.list.user?.email;
        const organizerPhone = (gift.list as any).organizerPhone;

        if (organizerEmail || organizerPhone) {
            try {
                const { sendGiftSelectionEmail, sendGiftSelectionSMS } = await import("@/lib/notifications");

                // Email
                if (organizerEmail) {
                    await sendGiftSelectionEmail({
                        to: organizerEmail,
                        organizerName: gift.list.organizerName,
                        guestName: data.guestName,
                        giftName: gift.name,
                        listTitle: gift.list.title,
                        quantity: data.quantity,
                        message: data.message
                    });
                }

                // SMS
                if (organizerPhone) {
                    await sendGiftSelectionSMS({
                        to: organizerPhone,
                        guestName: data.guestName,
                        giftName: gift.name,
                        quantity: data.quantity
                    });
                }
            } catch (notifyError) {
                console.error("DEBUG: Failed to send notification", notifyError);
            }
        }

        console.log("DEBUG: selectGift success, revalidating paths");
        revalidatePath(`/list/${gift.listId}`);
        revalidatePath(`/list/${gift.list.slug}`);
        revalidatePath(`/dashboard/${gift.listId}`);
        return { success: true, selectionId: selection.id };
    } catch (error) {
        console.error("DEBUG: selectGift error:", error);
        return { error: "Ocorreu um erro ao confirmar o presente. Tente novamente." };
    }
}

export async function submitRSVP(listId: string, data: {
    guestName: string;
    guestContact?: string;
    status: string;
    message?: string;
    companionName?: string;
    hasChildren?: boolean;
}) {
    try {
        await prisma.attendance.create({
            data: {
                listId,
                ...data
            }
        });
        revalidatePath(`/list/${listId}`);
        revalidatePath(`/dashboard/${listId}`);
        return { success: true };
    } catch (error) {
        console.error("submitRSVP error:", error);
        return { error: "Ocorreu um erro ao confirmar presença." };
    }
}

export async function deleteGiftList(listId: string) {
    await prisma.giftList.delete({
        where: { id: listId }
    });
    revalidatePath("/dashboard");
    redirect("/dashboard");
}
export async function cancelSelection(selectionId: string) {
    try {
        const selection = await prisma.selection.delete({
            where: { id: selectionId },
            include: { gift: true }
        });
        revalidatePath(`/list/${selection.gift.listId}`);
        revalidatePath(`/dashboard/${selection.gift.listId}`);
        return { success: true };
    } catch (error) {
        console.error("cancelSelection error:", error);
        return { error: "Erro ao remover seleção." };
    }
}
