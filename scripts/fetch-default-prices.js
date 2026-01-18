
const crypto = require('crypto');

// Copy of Shopee Logic

async function resolveUrl(shortUrl) {
    try {
        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'manual'
        });
        const location = response.headers.get('location');
        if (location) return location;

        // If not manual redirect, maybe it follows? 
        // Let's try normal fetch
        const response2 = await fetch(shortUrl);
        return response2.url;
    } catch (e) {
        console.error("Resolve error", e);
        return shortUrl;
    }
}

const fs = require('fs');
const path = require('path');

function getEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
        return env;
    } catch (e) {
        console.error("Could not read .env", e);
        return {};
    }
}

async function getShopeeProductDetails(url) {
    const env = getEnv();
    const appId = env.SHOPEE_APP_ID;
    const appSecret = env.SHOPEE_APP_SECRET;

    if (!appId || !appSecret || !url) {
        console.error("Missing Shopee credentials or URL (Checked .env)");
        return { imageUrl: null, price: null };
    }

    try {
        const longUrl = await resolveUrl(url);
        let keyword = "";

        if (longUrl.includes("shopee.com.br") && longUrl.includes("-i.")) {
            try {
                const parts = longUrl.split('shopee.com.br/')[1].split('-i.')[0];
                keyword = decodeURIComponent(parts).replace(/-/g, ' ');
            } catch (e) {
                console.error("Error parsing slug:", e);
            }
        }

        // Fallback or if parsing failed, try searching by the text in the URL if possible
        if (!keyword) {
            // For affiliate links we might need other parsing.
            console.error("Could not extract keyword from", longUrl);
            return { imageUrl: null, price: null };
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const query = `
        query {
            productOfferV2(
                keyword: "${keyword}",
                limit: 1
            ) {
                nodes {
                    imageUrl
                    price
                    priceMin
                    productName
                }
            }
        }`;

        const payload = JSON.stringify({ query });
        const factor = appId + timestamp + payload + appSecret;
        const signature = crypto.createHash('sha256').update(factor).digest('hex');

        const response = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
            },
            body: payload,
        });

        const data = await response.json();
        const node = data?.data?.productOfferV2?.nodes?.[0];

        if (!node) {
            console.error(`No data for ${url} (Keyword: ${keyword})`);
            return { imageUrl: null, price: null };
        }

        return {
            imageUrl: node.imageUrl || null,
            price: node.price || node.priceMin || null
        };
    } catch (error) {
        console.error("Shopee API Error:", error);
        return { imageUrl: null, price: null };
    }
}

// The GIFTS (Pasted from default-gifts.ts manually by me in next step, or I can read the file)
// actually I'll verify the file content first to regex it. 
// For now I'll write the fetcher shell.

const GIFTS = [
    { name: "Conjunto de talheres (garfos, facas, colheres)", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-lp6iza7h4vidfd", buyLink: "https://s.shopee.com.br/70DgPozxmT" },
    { name: "Conjunto de pratos (rasos, fundos, sobremesa)", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-ma9wbmp4u0e117", buyLink: "https://s.shopee.com.br/8zyknbKisy" },
    { name: "Copos", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-mb5nnw9a7c0f0f", buyLink: "https://s.shopee.com.br/1BFtTJq2zf" },
    { name: "Panela de pressão", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdwb-m0x78cp0sfyca0", buyLink: "https://s.shopee.com.br/6KxzczRw1Z" },
    { name: "Assadeiras", category: "Cozinha", buyLink: "https://s.shopee.com.br/9KbbCZAZEY" },
    { name: "Tábua de cortar", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rbm5-m5d121s72yd0c5", buyLink: "https://s.shopee.com.br/W0CgTixWn" },
    { name: "Conjunto de utensílios", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdya-m024n5dghn0a54", buyLink: "https://s.shopee.com.br/9fERbNUqiR" },
    { name: "Ralador/Descascador", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdw4-lyfko349gab0ac", buyLink: "https://s.shopee.com.br/8APdofzkK5" },
    { name: "Potes herméticos", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rast-ma39uigua8pd55", buyLink: "https://s.shopee.com.br/7V9x1WICN9" },
    { name: "Potes mantimentos", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdxy-lxis6bqt6xfue1", buyLink: "https://s.shopee.com.br/5q1j2VRndx" },
    { name: "Porta tempero", category: "Cozinha", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-m6xepi2ftels18", buyLink: "https://s.shopee.com.br/1gCA5BdVgp" },
    { name: "Cafeteira elétrica", category: "Eletrodomésticos", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rffx-m9yiew8r4trda5", buyLink: "https://s.shopee.com.br/3VdoGHqb4x" },
    { name: "Torradeira", category: "Eletrodomésticos", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rfi1-m9yigvqshztbc4", buyLink: "https://s.shopee.com.br/13w5tcNbY" },
    { name: "Liquidificador", category: "Eletrodomésticos", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-mc83lzgst4gw71", buyLink: "https://s.shopee.com.br/6KxzdaD3gf" },
    { name: "Chaleira elétrica", category: "Eletrodomésticos", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mfo2ou0hkao01c", buyLink: "https://s.shopee.com.br/10wTHpA9OV" },
    { name: "Airfryer", category: "Eletrodomésticos", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81ztc-mivj61ur5z4198", buyLink: "https://s.shopee.com.br/3fxESmP7HO" },
    { name: "Vassoura, pá e rodo", category: "Lavanderia", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7repu-m8xms5gkp3px67", buyLink: "https://s.shopee.com.br/3B0xs1N37C" },
    { name: "Balde", category: "Lavanderia", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7reo7-m8evgw0duobb5b", buyLink: "https://s.shopee.com.br/20p0Tv4DAR" },
    { name: "Esfregões", category: "Lavanderia", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mh0gpooee611d9", buyLink: "https://s.shopee.com.br/AAAiD39xaN" },
    { name: "Cestos de roupa", category: "Lavanderia", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mgokugbz3g9128", buyLink: "https://s.shopee.com.br/AUnYbjp0K3" },
    { name: "Roupas de limpeza (esponjas, escovas, flanelas)", category: "Lavanderia", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-m48w7dr9yf9d8c", buyLink: "https://s.shopee.com.br/8KjFtindnG" },
    { name: "Toalhas de banho e rosto", category: "Banheiro", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-m50gz5vd1aya23", buyLink: "https://s.shopee.com.br/1VsvlJEHWw" },
    { name: "Tapete antiderrapante", category: "Banheiro", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdxv-md6gn8s9a3nkce", buyLink: "https://s.shopee.com.br/8pfWZVVGmC" },
    { name: "Porta-sabonete/dispensers", category: "Banheiro", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rbk4-m5vz4m8260ifcb", buyLink: "https://s.shopee.com.br/5fiUnkbEy" },
    { name: "Cesta organizadora", category: "Banheiro", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mggb77065p1j3e", buyLink: "https://s.shopee.com.br/1LZVdr3Fh4" },
    { name: "Lixeira para banheiro", category: "Banheiro", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-mdapzb7cvo6qb0", buyLink: "https://s.shopee.com.br/8pfWZihgbP" },
    { name: "Lençol e fronha", category: "Quarto", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-m6s7hmorl4cn9d", buyLink: "https://s.shopee.com.br/40aGoxNRzS" },
    { name: "Cobre-leito", category: "Quarto", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-micx08rups030d", buyLink: "https://s.shopee.com.br/BNYG6FntA" },
    { name: "Travesseiros", category: "Quarto", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdwj-mc3ykysuflimb9", buyLink: "https://s.shopee.com.br/1qVmFDPqVJ" },
    { name: "Cabides", category: "Quarto", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mfcs3uwyls783e", buyLink: "https://s.shopee.com.br/9KbnB29Tkr" },
    { name: "Edredom", category: "Quarto", imageUrl: "https://cf.shopee.com.br/file/e7f9fde9067d4c36e9c7c8202ff90f5b", buyLink: "https://s.shopee.com.br/6KyBbb1Q1O" },
    { name: "Almofadas", category: "Sala", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-ma8srfzstx892f", buyLink: "https://s.shopee.com.br/6VHfbFfw9f" },
    { name: "Manta para sofá", category: "Sala", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-8258m-mgfbsqcsxtl520", buyLink: "https://s.shopee.com.br/4fq1PudRkR" },
    { name: "TV", category: "Sala", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-lukqws4dn82cf9", buyLink: "https://s.shopee.com.br/1BG9Fb9wSI" },
    { name: "Caixas organizadoras", category: "Organização", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-822y3-mi5g1zd9c35udf", buyLink: "https://s.shopee.com.br/AAAxyD0Shg" },
    { name: "Organizadores de gaveta", category: "Organização", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7qukw-ljmp8btohrii2a", buyLink: "https://s.shopee.com.br/4VWbDq3Dw5" },
    { name: "Estante", category: "Organização", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7ren6-m8dkpbtglpjl06", buyLink: "https://s.shopee.com.br/6puW0CRiV4" },
    { name: "Suportes para sapatos/armário", category: "Organização", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rdyd-lzqcdl1n0gv6e1", buyLink: "https://s.shopee.com.br/2VlWqGzD9B" },
    { name: "Quadros/decor", category: "Decoração", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-maczkveepq4v1b", buyLink: "https://s.shopee.com.br/2B8gRkOeTc" },
    { name: "Luminárias ou abajur", category: "Decoração", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-821gb-mh807gw3nqbx6a", buyLink: "https://s.shopee.com.br/2qONF2TMlk" },
    { name: "Tapetes", category: "Decoração", imageUrl: "https://cf.shopee.com.br/file/br-11134207-7r98o-m969t86ug8xl5e", buyLink: "https://s.shopee.com.br/1qVq3E62I4" },
    { name: "Extensões e filtros de tomada", category: "Utilidades", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-824gy-mfed14o5tgy7d5", buyLink: "https://s.shopee.com.br/8V2jzWjhsk" },
    { name: "Câmera de segurança", category: "Utilidades", buyLink: "https://s.shopee.com.br/1Vszelpzu1" },
    { name: "Jogo de jogos de tabuleiro", category: "Lazer", imageUrl: "https://cf.shopee.com.br/file/br-11134207-81z1k-mfn8wv32chz854", buyLink: "https://s.shopee.com.br/AKUOB3m5qc" },
    { name: "Balde de gelo", category: "Lazer", imageUrl: "https://cf.shopee.com.br/file/sg-11134201-7rfh6-m3wg9oezmv6oe8", buyLink: "https://s.shopee.com.br/9AIQmx77Su" }
];

async function update() {
    console.error("Fetching prices...");
    const updated = [];
    for (const g of GIFTS) {
        if (g.buyLink) {
            console.error("Fetching:", g.name);
            const { price } = await getShopeeProductDetails(g.buyLink);
            updated.push({ ...g, priceEstimate: price });
            // wait a bit to avoid rate limits
            await new Promise(r => setTimeout(r, 200));
        } else {
            updated.push(g);
        }
    }

    // Print in TS format
    console.log("export const DEFAULT_GIFTS = [");
    updated.forEach(u => {
        console.log(`    { name: "${u.name}", category: "${u.category}", imageUrl: "${u.imageUrl || ''}", buyLink: "${u.buyLink || ''}", priceEstimate: ${u.priceEstimate || 'null'} },`);
    });
    console.log("];");
}

update();
