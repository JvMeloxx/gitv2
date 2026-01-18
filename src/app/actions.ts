"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { GIFT_TEMPLATES } from "@/lib/templates";
import { EventType } from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession, login, logout } from "@/lib/auth";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const PLATFORM_FEE_PERCENT = 0.03; // 3% fee
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function isAdmin() {
    const session = await getSession();
    if (!session || !session.userId) return false;
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    return user?.email === ADMIN_EMAIL;
}

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

        if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
            console.log("DEBUG: Invalid credentials", { email });
            return { error: "Credenciais inválidas. Se você criou conta com Google, use o botão do Google." };
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

import { DEFAULT_GIFTS } from "@/lib/default-gifts";
import { generateShopeeLink, getShopeeProductDetails } from "@/lib/shopee";

export async function createGiftList(formData: {
    eventType: EventType;
    organizerName: string;
    title: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    coverImageUrl?: string;
    theme?: string;
    backgroundImageUrl?: string;
    organizerPhone?: string;
    organizerEmail?: string;
    isCashEnabled?: boolean;
    selectedGifts?: {
        name: string;
        category: string;
        description?: string;
        quantityNeeded: number;
        imageUrl?: string;
        buyLink?: string;
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
            eventTime,
            location,
            coverImageUrl,
            theme,
            backgroundImageUrl,
            organizerPhone,
            organizerEmail,
            isCashEnabled,
            selectedGifts
        } = formData;

        // Start with provided gifts or templates
        let initialGiftsData: any[] = [];
        if (selectedGifts && selectedGifts.length > 0) {
            initialGiftsData = [...selectedGifts];
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

        // Add Default Gifts (Shopee Affiliate Items)
        // We append them to ensure they appear.
        const defaultGiftsWithQuantity = DEFAULT_GIFTS.map(gift => ({
            ...gift,
            quantityNeeded: 1, // Default quantity
        }));

        initialGiftsData = [...initialGiftsData, ...defaultGiftsWithQuantity];

        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(4)}`;

        const list = await prisma.giftList.create({
            data: {
                slug,
                title,
                organizerName,
                eventType,
                eventDate,
                eventTime,
                location,
                organizerPhone: (formData as any).organizerPhone,
                organizerEmail: (formData as any).organizerEmail,
                coverImageUrl,
                theme: theme || "default",
                backgroundImageUrl,
                userId, // Connect to user if authenticated
                isCashEnabled: !!isCashEnabled,
                gifts: {
                    create: initialGiftsData
                }
            } as any
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
    buyLink?: string;
}) {
    let finalBuyLink = data.buyLink;
    let finalImageUrl = data.imageUrl;

    if (finalBuyLink) {
        if (finalBuyLink.includes("shopee")) {
            try {
                const { imageUrl: fetchedImage, price: fetchedPrice } = await getShopeeProductDetails(finalBuyLink);
                if (fetchedImage) {
                    finalImageUrl = fetchedImage;
                }
                if (fetchedPrice) {
                    // Update priceEstimate if not provided manually
                    if (!data.priceEstimate) {
                        data.priceEstimate = fetchedPrice;
                    }
                }
            } catch (e) {
                console.error("Failed to auto-fetch Shopee image", e);
            }
        }

        const shopeeLink = await generateShopeeLink(finalBuyLink);
        if (shopeeLink) {
            finalBuyLink = shopeeLink;
        }
    }

    await prisma.gift.create({
        data: {
            listId,
            ...data,
            imageUrl: finalImageUrl,
            buyLink: finalBuyLink
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
    buyLink?: string;
}) {
    let finalBuyLink = data.buyLink;
    let finalImageUrl = data.imageUrl;

    if (finalBuyLink) {
        if (finalBuyLink.includes("shopee")) {
            try {
                const { imageUrl: fetchedImage, price: fetchedPrice } = await getShopeeProductDetails(finalBuyLink);
                if (fetchedImage) {
                    finalImageUrl = fetchedImage;
                }
                if (fetchedPrice) {
                    // Update priceEstimate if not provided manually
                    if (!data.priceEstimate) {
                        data.priceEstimate = fetchedPrice;
                    }
                }
            } catch (e) {
                console.error("Failed to auto-fetch Shopee image", e);
            }
        }

        const shopeeLink = await generateShopeeLink(finalBuyLink);
        if (shopeeLink) {
            finalBuyLink = shopeeLink;
        }
    }

    const gift = await prisma.gift.update({
        where: { id: giftId },
        data: {
            ...data,
            imageUrl: finalImageUrl,
            buyLink: finalBuyLink
        }
    });
    revalidatePath(`/dashboard/${gift.listId}`);
}

export async function deleteGift(giftId: string) {
    const gift = await prisma.gift.delete({
        where: { id: giftId }
    });
    revalidatePath(`/dashboard/${gift.listId}`);
}

export async function selectGift(giftId: string | null, data: {
    guestName: string;
    guestContact?: string;
    message?: string;
    quantity: number;
    listId?: string;
    customAmount?: number;
}) {
    try {
        console.log("DEBUG: selectGift started", { giftId, data });

        let gift: any = null;
        let listId = data.listId;

        if (giftId && !giftId.startsWith("quota-")) {
            gift = await prisma.gift.findUnique({
                where: { id: giftId },
                include: { list: { include: { user: true } } }
            });
            if (!gift) throw new Error("Gift not found");
            listId = gift.listId;
        }

        // Create Selection Data
        const selectionData: any = {
            giftId: giftId && !giftId.startsWith("quota-") ? giftId : null,
            listId: !giftId || giftId.startsWith("quota-") ? listId : null,
            guestName: data.guestName,
            guestContact: data.guestContact,
            message: data.message,
            quantity: data.quantity,
        };

        // Handle Payment if Cash is enabled
        const listObj = gift?.list || await (prisma as any).giftList.findUnique({ where: { id: listId }, include: { user: true } });
        const listData = listObj as any;
        let checkoutUrl = null;
        const mpAccessToken = process.env.MP_ACCESS_TOKEN;

        const price = gift ? gift.priceEstimate : data.customAmount;

        // Logic change: Only charge if it's a specific cash contribution (via customAmount/quota) 
        // Regular gifts with priceEstimates are just reservations.
        const shouldCharge = listData.isCashEnabled && data.customAmount;

        if (shouldCharge) {
            if (!mpAccessToken) {
                console.error("DEBUG: Missing MP_ACCESS_TOKEN");
                return { error: "Erro de configuração do sistema: Pagamentos indisponíveis no momento." };
            }

            // Fee Refactor: Guest pays exact price. Fee is deducted on withdrawal.
            const fee = 0;
            const total = price;

            selectionData.paymentStatus = "PENDING";
            selectionData.platformFee = fee;
            selectionData.paidAmount = total * data.quantity;

            try {
                const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
                const preference = new Preference(client);

                const response = await preference.create({
                    body: {
                        items: [
                            {
                                id: giftId || listData.id,
                                title: gift ? gift.name : `Cota de Presente - ${listData.title}`,
                                quantity: data.quantity,
                                unit_price: total,
                                currency_id: 'BRL',
                            }
                        ],
                        back_urls: {
                            success: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/list/${listData.slug}?payment=success`,
                            failure: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/list/${listData.slug}?payment=failure`,
                            pending: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/list/${listData.slug}?payment=pending`,
                        },
                        auto_return: 'approved',
                        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/webhooks/mercadopago`,
                        external_reference: listData.id,
                    }
                });

                checkoutUrl = response.init_point;
                selectionData.paymentId = response.id;
            } catch (mpError) {
                console.error("DEBUG: Mercado Pago Preference Error", mpError);
                return { error: "Erro ao iniciar o pagamento. Tente novamente." };
            }
        }

        const selection = await prisma.selection.create({
            data: selectionData
        });

        // Send notifications (only if NOT cash or if we want to notify about pending?)
        const organizerEmail = listData.organizerEmail || listData.user?.email;
        const organizerPhone = listData.organizerPhone;

        if (organizerEmail || organizerPhone) {
            try {
                const { sendGiftSelectionEmail, sendGiftSelectionSMS } = await import("@/lib/notifications");

                // Email
                if (organizerEmail) {
                    await sendGiftSelectionEmail({
                        to: organizerEmail,
                        organizerName: listData.organizerName,
                        guestName: data.guestName,
                        giftName: gift?.name || "Cota de Presente",
                        listTitle: listData.title,
                        quantity: data.quantity,
                        message: data.message
                    });
                }

                // SMS
                if (organizerPhone) {
                    await sendGiftSelectionSMS({
                        to: organizerPhone,
                        guestName: data.guestName,
                        giftName: gift?.name || "Cota de Presente",
                        quantity: data.quantity
                    });
                }
            } catch (notifyError) {
                console.error("DEBUG: Failed to send notification", notifyError);
            }
        }

        console.log("DEBUG: selectGift success, revalidating paths");
        revalidatePath(`/list/${listData.id}`);
        revalidatePath(`/list/${listData.slug}`);
        revalidatePath(`/dashboard/${listData.id}`);

        return {
            success: true,
            selectionId: selection.id,
            checkoutUrl // Return this to the client
        };
    } catch (error) {
        console.error("DEBUG: selectGift error:", error);
        return { error: "Ocorreu um erro ao confirmar o presente. Tente novamente." };
    }
}

export async function updateListFinance(listId: string, data: {
    isCashEnabled: boolean;
    quotaValues?: number[];
}) {
    const list = await (prisma as any).giftList.update({
        where: { id: listId },
        data: data as any
    });

    revalidatePath(`/dashboard/${listId}`);
    revalidatePath(`/list/${listId}`);
    if (list.slug) {
        revalidatePath(`/list/${list.slug}`);
    }
}

export async function requestWithdrawal(listId: string, data: {
    amount: number;
    pixKey?: string;
    bankDetails?: string;
}) {
    const list = await (prisma as any).giftList.findUnique({
        where: { id: listId },
        select: { balance: true }
    });

    if (!list || list.balance < data.amount) {
        return { error: "Saldo insuficiente para o saque solicitado." };
    }

    await (prisma as any).withdrawalRequest.create({
        data: {
            listId,
            amount: data.amount,
            pixKey: data.pixKey,
            bankDetails: data.bankDetails,
            status: "PENDING"
        }
    });

    revalidatePath(`/dashboard/${listId}`);
    return { success: true };
}

export async function submitRSVP(listId: string, data: {
    guestName: string;
    guestContact?: string;
    status: string;
    message?: string;
    adultsCount?: number;
    childrenCount?: number;
    babiesCount?: number;
}) {
    try {
        await (prisma as any).attendance.create({
            data: {
                listId,
                ...data
            }
        });

        // Send Notification
        try {
            const list = await (prisma as any).giftList.findUnique({
                where: { id: listId },
                include: { user: true }
            });

            const organizerEmail = list?.organizerEmail || list?.user?.email;

            if (organizerEmail) {
                const { sendRSVPEmail } = await import("@/lib/notifications");
                const totalGuests = (data.adultsCount || 0) + (data.childrenCount || 0) + (data.babiesCount || 0) + 1; // +1 for the guest themselves if implied, but usually "guestName" is one of the adults? 
                // In our form logic: "Adults in group". Often includes the filler.
                // Let's assume passed counts are total. 
                // Actually, the new form has "Adultos", "Crianças". 
                // Let's just sum them up. 
                // Wait, if adultsCount is 0, is it just the guestName? 
                // User enters "Adults count" directly. 

                await sendRSVPEmail({
                    to: organizerEmail,
                    organizerName: list.organizerName,
                    guestName: data.guestName,
                    listTitle: list.title,
                    status: data.status,
                    totalGuests: (data.adultsCount || 0) + (data.childrenCount || 0) + (data.babiesCount || 0),
                    message: data.message
                });
            }
        } catch (e) {
            console.error("Error sending RSVP notification", e);
        }

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
        const selection = await (prisma as any).selection.delete({
            where: { id: selectionId },
            include: { gift: true }
        });
        const listId = selection.gift?.listId || selection.listId;
        if (listId) {
            revalidatePath(`/list/${listId}`);
            revalidatePath(`/dashboard/${listId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("cancelSelection error:", error);
        return { error: "Erro ao remover seleção." };
    }
}

// --- Admin Actions ---

export async function approveWithdrawal(requestId: string) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    try {
        const request = await (prisma as any).withdrawalRequest.update({
            where: { id: requestId },
            data: { status: "COMPLETED" }
        });

        // Decrement balance only on approval to keep funds "available" until actually paid out?
        // Or should we have decremented on request? Logic varies. 
        // Let's assume on approval for now as per plan.
        const list = await (prisma as any).giftList.update({
            where: { id: request.listId },
            data: {
                balance: { decrement: request.amount }
            }
        });

        revalidatePath(`/dashboard/${request.listId}`);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("approveWithdrawal error:", error);
        return { error: "Erro ao aprovar saque." };
    }
}

export async function rejectWithdrawal(requestId: string) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    try {
        const request = await (prisma as any).withdrawalRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("rejectWithdrawal error:", error);
        return { error: "Erro ao rejeitar saque." };
    }
}
