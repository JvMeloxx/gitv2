
import crypto from "crypto";

const SHOPEE_APP_ID = process.env.SHOPEE_APP_ID;
const SHOPEE_APP_SECRET = process.env.SHOPEE_APP_SECRET;
const SHOPEE_API_URL = "https://open-api.affiliate.shopee.com.br/graphql";

export async function generateShopeeLink(originalUrl: string): Promise<string | null> {
    if (!SHOPEE_APP_ID || !SHOPEE_APP_SECRET) {
        console.error("Shopee credentials not found");
        return null;
    }

    // Improve URL detection: check if it is a valid Shopee URL
    if (!originalUrl.includes("shopee.com.br") && !originalUrl.includes("s.shopee.com.br")) {
        return originalUrl;
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const query = `
        mutation {
            generateShortLink(input: { originUrl: "${originalUrl}" }) {
                shortLink
            }
        }
    `;

    const payload = JSON.stringify({ query });

    // Signature = sha256(appId + timestamp + payload + secret)
    const baseString = SHOPEE_APP_ID + timestamp + payload + SHOPEE_APP_SECRET;
    const signature = crypto.createHash("sha256").update(baseString).digest("hex");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `SHA256 Credential=${SHOPEE_APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
    };

    try {
        const response = await fetch(SHOPEE_API_URL, {
            method: "POST",
            headers,
            body: payload,
        });

        const data = await response.json();

        if (data.errors) {
            console.error("Shopee API Error:", JSON.stringify(data.errors));
            return null;
        }

        return data.data?.generateShortLink?.shortLink || null;
    } catch (error) {
        console.error("Failed to generate Shopee link:", error);
        return null;
    }
}

async function resolveUrl(shortUrl: string): Promise<string> {
    try {
        const response = await fetch(shortUrl, { redirect: 'follow', method: 'HEAD' });
        return response.url;
    } catch (e) {
        return shortUrl;
    }
}

export async function getShopeeProductDetails(url: string): Promise<{ imageUrl: string | null; price: number | null }> {
    if (!SHOPEE_APP_ID || !SHOPEE_APP_SECRET || !url) return { imageUrl: null, price: null };

    try {
        const longUrl = await resolveUrl(url);
        let keyword = "";

        if (longUrl.includes("shopee.com.br") && longUrl.includes("-i.")) {
            try {
                const parts = longUrl.split('shopee.com.br/')[1].split('-i.')[0];
                keyword = decodeURIComponent(parts).replace(/-/g, ' ');
            } catch (e) {
                console.error("Error parsing slug:", e);
                return { imageUrl: null, price: null };
            }
        }

        if (!keyword) return { imageUrl: null, price: null };

        const timestamp = Math.floor(Date.now() / 1000);
        const query = `
            query {
                productOfferV2(
                    keyword: "${keyword.replace(/"/g, '')}",
                    limit: 1
                ) {
                    nodes {
                        imageUrl
                        price
                        priceMin
                        priceMax
                    }
                }
            }
        `;

        const payload = JSON.stringify({ query });
        const baseString = SHOPEE_APP_ID + timestamp + payload + SHOPEE_APP_SECRET;
        const signature = crypto.createHash("sha256").update(baseString).digest("hex");

        const response = await fetch(SHOPEE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SHA256 Credential=${SHOPEE_APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
            },
            body: payload,
        });

        const data = await response.json();
        const node = data?.data?.productOfferV2?.nodes?.[0];

        return {
            imageUrl: node?.imageUrl || null,
            price: node?.price || node?.priceMin || null
        };

    } catch (error) {
        console.error("Error fetching Shopee details:", error);
        return { imageUrl: null, price: null };
    }
}
