
const crypto = require('crypto');
require('dotenv').config();

const APP_ID = process.env.SHOPEE_APP_ID;
const APP_SECRET = process.env.SHOPEE_APP_SECRET;
const URL = "https://open-api.affiliate.shopee.com.br/graphql";

async function testShopeeGraphQL() {
    if (!APP_ID || !APP_SECRET) {
        console.error("Missing Shopee credentials");
        return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const itemUrl = "Faqueiro Brinox";

    const query = `
        query {
            productOfferV2(
                keyword: "${itemUrl}",
                limit: 1
            ) {
                nodes {
                    itemId
                    shopId
                    productName
                    imageUrl
                    price
                }
            }
        }
    `;

    const payload = JSON.stringify({ query });
    const baseString = APP_ID + timestamp + payload + APP_SECRET;
    const signature = crypto.createHash("sha256").update(baseString).digest("hex");

    console.log("Sending request...");
    console.log("Timestamp:", timestamp);

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
            },
            body: payload,
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testShopeeGraphQL();
