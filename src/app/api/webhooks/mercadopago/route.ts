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

            // 1. Get payment details from Mercado Pago
            // We need an access token. Since webhooks don't tell us which list it belongs to easily
            // except via external_reference, we'll need to fetch the payment with a master token 
            // OR find the list first. 
            // BUT Mercado Pago's 'payment' notification usually doesn't include external_reference 
            // in the notification itself, only in the payment details.

            // To make it simple for this MVP, we find the selection by paymentId
            const selection = await (prisma as any).selection.findFirst({
                where: { paymentId: String(paymentId) },
                include: { gift: { include: { list: true } } }
            });

            if (selection && (selection as any).gift.list.mercadopagoAccessToken) {
                const client = new MercadoPagoConfig({ accessToken: (selection as any).gift.list.mercadopagoAccessToken });
                const payment = new Payment(client);

                const mpPayment = await payment.get({ id: paymentId });

                if (mpPayment.status === "approved") {
                    await (prisma as any).selection.update({
                        where: { id: selection.id },
                        data: { paymentStatus: "PAID" }
                    });
                    console.log(`Payment confirmed for selection ${selection.id}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Mercado Pago Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
