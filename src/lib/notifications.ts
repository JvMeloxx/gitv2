import { Resend } from 'resend';
import twilio from 'twilio';

// Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

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
        console.warn("DEBUG [Email]: RESEND_API_KEY not found. Email will not be sent.");
        return;
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log(`DEBUG [Email]: Attempting to send email to ${to}...`);
        const result = await resend.emails.send({
            from: 'Gifts2 <onboarding@resend.dev>',
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
                    <p style="font-size: 14px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                        Que tal dar uma olhadinha no seu painel para ver como anda a lista? 😊
                    </p>
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://gifts2.vercel.app/dashboard" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold;">Ver meu Painel</a>
                    </div>
                </div>
            `,
        });
        console.log("DEBUG [Email]: Resend result:", result);
    } catch (error) {
        console.error("DEBUG [Email]: Error via Resend:", error);
    }
}

export async function sendGiftSelectionSMS({
    to,
    guestName,
    giftName,
    quantity
}: {
    to: string;
    guestName: string;
    giftName: string;
    quantity: number;
}) {
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioClient || !from) {
        console.log(`DEBUG [SMS MOCK]: To ${to} - 🎁 ${guestName} escolheu ${quantity}x ${giftName}!`);
        return;
    }

    try {
        console.log(`DEBUG [SMS]: Sending to ${to}...`);
        const message = await twilioClient.messages.create({
            body: `Gifts2: 🎁 ${guestName} escolheu ${quantity}x ${giftName} na sua lista!`,
            from,
            to
        });
        console.log("DEBUG [SMS]: Twilio SID:", message.sid);
    } catch (error) {
        console.error("DEBUG [SMS]: Error via Twilio:", error);
    }
}

export async function sendRSVPEmail({
    to,
    organizerName,
    guestName,
    listTitle,
    status,
    totalGuests,
    message
}: {
    to: string;
    organizerName: string;
    guestName: string;
    listTitle: string;
    status: string;
    totalGuests: number;
    message?: string;
}) {
    // If no API key, skip
    if (!process.env.RESEND_API_KEY) return;

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const statusText = status === 'yes' ? 'Sim, eu vou!' : status === 'maybe' ? 'Talvez' : 'Não poderei ir';
        const color = status === 'yes' ? '#16a34a' : status === 'maybe' ? '#ca8a04' : '#dc2626';

        await resend.emails.send({
            from: 'Gifts2 <onboarding@resend.dev>',
            to,
            subject: `💌 Novo RSVP em "${listTitle}": ${guestName}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                    <h2 style="color: #374151;">Oi, ${organizerName}!</h2>
                    <p style="font-size: 16px;">
                        <strong>${guestName}</strong> acabou de responder ao convite da lista <strong>"${listTitle}"</strong>.
                    </p>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Resposta</p>
                        <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: ${color};">${statusText}</p>
                        
                        ${totalGuests > 0 ? `
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Total de Pessoas (neste grupo):</p>
                            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">${totalGuests}</p>
                        </div>
                        ` : ''}
                    </div>

                    ${message ? `
                    <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; color: #1e40af; font-style: italic;">
                        "${message}"
                    </div>
                    ` : ''}

                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://gifts2.vercel.app/dashboard" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Ver Lista de Presença</a>
                    </div>
                </div>
            `,
        });
    } catch (error) {
        console.error("DEBUG [Email]: Error sending RSVP email:", error);
    }
}
