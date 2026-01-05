import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body;

        // We only care about payment notifications
        if (type === "payment") {
            const paymentId = data.id;
            const mpAccessToken = process.env.MP_ACCESS_TOKEN;

            if (!mpAccessToken) {
                console.error("MP_ACCESS_TOKEN not configured");
                return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
            }

            // 1. Get payment details from Mercado Pago
            const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
            const payment = new Payment(client);
            const mpPayment = await payment.get({ id: paymentId });

            if (mpPayment.status === "approved") {
                // 2. Find Selection by Payment ID
                // We'll search by paymentId. It could be stored in Selection.paymentId
                // OR we can find it by external_reference (listId) and other criteria if needed.
                // Our Selection model HAS paymentId.
                const selection = await (prisma as any).selection.findFirst({
                    where: { paymentId: String(paymentId) },
                    include: { gift: true, list: true }
                });

                if (selection && selection.paymentStatus !== "PAID") {
                    const listId = selection.gift?.listId || selection.listId;
                    const amount = (mpPayment.transaction_amount || 0);
                    // The organizer receives the transaction_amount minus the platform fee
                    // Wait, guests pay the fee ON TOP. So if gift is 100, guest pays 105.
                    // transaction_amount will be 105.
                    // Organizer should receive 100.
                    // Our fee is 5%. Total = Price * 1.05.
                    // Price = Total / 1.05.
                    const organizerAmount = amount / 1.05;

                    await prisma.$transaction([
                        (prisma as any).selection.update({
                            where: { id: selection.id },
                            data: { paymentStatus: "PAID" }
                        }),
                        (prisma as any).giftList.update({
                            where: { id: listId },
                            data: { balance: { increment: organizerAmount } }
                        })
                    ]);

                    console.log(`Payment confirmed for selection ${selection.id}. Credited R$ ${organizerAmount.toFixed(2)} to list ${listId}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Mercado Pago Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
