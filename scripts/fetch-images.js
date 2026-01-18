
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const APP_ID = process.env.SHOPEE_APP_ID;
const APP_SECRET = process.env.SHOPEE_APP_SECRET;
const URL = "https://open-api.affiliate.shopee.com.br/graphql";

// Import existing gifts (hacky regex to parse the TS file or just copy paste the structure for script)
// Since it's TS, I can't require it directly in JS easily without compilation.
// I'll regex read the file to extract the array, process it, and write it back.

const GIFTS_PATH = path.join(__dirname, '../src/lib/default-gifts.ts');

async function resolveUrl(shortUrl) {
    try {
        const response = await fetch(shortUrl, { redirect: 'follow', method: 'HEAD' });
        return response.url;
    } catch (e) {
        return shortUrl;
    }
}

async function searchShopeeImage(keyword) {
    const timestamp = Math.floor(Date.now() / 1000);
    const query = `
        query {
            productOfferV2(
                keyword: "${keyword.replace(/"/g, '')}",
                limit: 1
            ) {
                nodes {
                    imageUrl
                }
            }
        }
    `;

    const payload = JSON.stringify({ query });
    const baseString = APP_ID + timestamp + payload + APP_SECRET;
    const signature = crypto.createHash("sha256").update(baseString).digest("hex");

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
        return data?.data?.productOfferV2?.nodes?.[0]?.imageUrl || null;
    } catch (error) {
        console.error(`Error searching for ${keyword}:`, error.message);
        return null;
    }
}

async function main() {
    let content = fs.readFileSync(GIFTS_PATH, 'utf8');

    // Regex to find objects: { name: "...", category: "...", buyLink: "..." }
    // We want to capture the buyLink and insert imageUrl if missing.
    const regex = /\{ name: "(.*?)", category: "(.*?)", buyLink: "(.*?)"(.*?)\}/g;

    // We can't replace async in regex replace. 
    // So we match all first.
    let match;
    const updates = [];

    // Copy regex for matching
    const matcher = new RegExp(regex);

    console.log("Starting image fetch...");

    while ((match = matcher.exec(content)) !== null) {
        const fullMatch = match[0];
        const name = match[1];
        const category = match[2];
        const link = match[3];
        const rest = match[4];

        if (fullMatch.includes("imageUrl:")) {
            continue; // Already has image
        }

        updates.push({
            fullMatch,
            name,
            category,
            link,
            rest
        });
    }

    console.log(`Found ${updates.length} items to process.`);

    for (const item of updates) {
        console.log(`Processing: ${item.name}...`);

        // Strategy: 
        // 1. Resolve URL to get slug
        // 2. Extract keywords from slug OR just use item.name

        // item.name is usually good enough "Conjunto de talheres"
        // But the long URL slug is better "Faqueiro-Brinox..."

        const longUrl = await resolveUrl(item.link);
        let keyword = item.name;

        if (longUrl.includes("shopee.com.br")) {
            // Extract slug: shopee.com.br/SLUG-i.ID.ID
            try {
                const parts = longUrl.split('shopee.com.br/')[1].split('-i.')[0];
                keyword = decodeURIComponent(parts).replace(/-/g, ' ');
            } catch (e) {
                // Fallback to name
            }
        }

        // Search
        const imageUrl = await searchShopeeImage(keyword);

        if (imageUrl) {
            console.log(`  > Found: ${imageUrl}`);
            // Replace in content
            // We verify fullMatch again to ensure we replace the exact string
            const newEntry = `{ name: "${item.name}", category: "${item.category}", imageUrl: "${imageUrl}", buyLink: "${item.link}"${item.rest} }`;
            content = content.replace(item.fullMatch, newEntry);
        } else {
            console.log(`  > Image NOT found.`);
        }

        // Wait a bit to be nice
        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(GIFTS_PATH, content, 'utf8');
    console.log("Done! Updated default-gifts.ts");
}

main();
