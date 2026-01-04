import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendGiftSelectionEmail({
    to,
    organizerName,
    guestName,
    giftName,
    listTitle,
    quantity,
    message
}: {
    to: string;
    organizerName: string;
    guestName: string;
    giftName: string;
    listTitle: string;
    quantity: number;
    message?: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not found. Email not sent.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Gifts2 <onboarding@resend.dev>', // Resend standard sender for dev
            to,
            subject: `🎁 Alguém escolheu um presente na sua lista: ${listTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ffe4e6; border-radius: 12px; padding: 24px;">
                    <h2 style="color: #e11d48;">Oi, ${organizerName}!</h2>
                    <p style="font-size: 16px; line-height: 1.5;">
                        Temos uma novidade incrível para a sua lista <strong>"${listTitle}"</strong>!
                    </p>
                    <div style="background-color: #fff1f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 18px;"><strong>${guestName}</strong> escolheu um presente:</p>
                        <p style="margin: 8px 0 0 0; font-size: 22px; color: #be123c;">🎁 ${quantity}x ${giftName}</p>
                    </div>
                    ${message ? `
                    <div style="font-style: italic; border-left: 4px solid #fecdd3; padding-left: 16px; margin: 20px 0; color: #666;">
                        "${message}"
                    </div>
                    ` : ''}
                    <p style="font-size: 14px; color: #999; margin-top: 32px; border-top: 1px solid #eee; pt-16px;">
                        Que tal dar uma olhadinha no seu painel para ver como anda a lista? 😊
                    </p>
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://gifts2.vercel.app/dashboard" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold;">Ver meu Painel</a>
                    </div>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending email via Resend:", error);
    }
}
