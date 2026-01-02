import { EventType, GiftTemplate } from "./types";

export const GIFT_TEMPLATES: Record<EventType, GiftTemplate> = {
    wedding: {
        name: "Wedding",
        items: [
            { name: "Dinner Set", category: "Kitchen", quantityNeeded: 1, description: "12-piece ceramic dinner set" },
            { name: "Cutlery Set", category: "Kitchen", quantityNeeded: 1, description: "24-piece stainless steel cutlery" },
            { name: "Blender", category: "Appliances", quantityNeeded: 1, description: "High-speed blender for smoothies" },
            { name: "Coffee Maker", category: "Appliances", quantityNeeded: 1, description: "Programmable drip coffee maker" },
            { name: "Toaster", category: "Appliances", quantityNeeded: 1, description: "2-slice toaster with wide slots" },
            { name: "Bed Sheets", category: "Bedroom", quantityNeeded: 2, description: "Queen size cotton sheet set" },
            { name: "Towels", category: "Bathroom", quantityNeeded: 4, description: "Soft bath towels" },
            { name: "Microwave", category: "Appliances", quantityNeeded: 1, description: "Countertop microwave oven" },
        ]
    },
    baby_shower: {
        name: "Baby Shower",
        items: [
            { name: "Diapers (Size 1)", category: "Essentials", quantityNeeded: 3, description: "Pack of 100 newborn diapers" },
            { name: "Baby Wipes", category: "Essentials", quantityNeeded: 5, description: "Unscented baby wipes" },
            { name: "Stroller", category: "Gear", quantityNeeded: 1, description: "Lightweight foldable stroller" },
            { name: "Crib", category: "Furniture", quantityNeeded: 1, description: "Convertible baby crib" },
            { name: "Onesies (3-6m)", category: "Clothing", quantityNeeded: 5, description: "Soft cotton onesies" },
            { name: "Baby Monitor", category: "Safety", quantityNeeded: 1, description: "Video baby monitor with night vision" },
            { name: "Baby Bathtub", category: "Bath", quantityNeeded: 1, description: "Non-slip baby bathtub" },
            { name: "Bottle Set", category: "Feeding", quantityNeeded: 1, description: "Newborn starter kit bottles" },
        ]
    },
    housewarming: {
        name: "Housewarming",
        items: [
            { name: "Cookware Set", category: "Kitchen", quantityNeeded: 1, description: "Non-stick pots and pans set" },
            { name: "Knife Set", category: "Kitchen", quantityNeeded: 1, description: "Chef knife block set" },
            { name: "Vacuum Cleaner", category: "Cleaning", quantityNeeded: 1, description: "Bagless upright vacuum" },
            { name: "Door Mat", category: "Decor", quantityNeeded: 1, description: "Welcome mat for front door" },
            { name: "Wall Clock", category: "Decor", quantityNeeded: 1, description: "Modern minimal wall clock" },
            { name: "Plant Pots", category: "Garden", quantityNeeded: 3, description: "Ceramic indoor plant pots" },
            { name: "Wine Glasses", category: "Bar", quantityNeeded: 1, description: "Set of 6 wine glasses" },
            { name: "Tool Kit", category: "Tools", quantityNeeded: 1, description: "Basic household tool kit" },
        ]
    },
    birthday: {
        name: "Birthday",
        items: [
            { name: "Gift Card", category: "General", quantityNeeded: 1, description: "Amazon or favorite store gift card" },
            { name: "Books", category: "Entertainment", quantityNeeded: 3, description: "Bestselling novels or non-fiction" },
            { name: "Board Game", category: "Entertainment", quantityNeeded: 1, description: "Strategy board game" },
        ]
    },
    other: {
        name: "Custom Event",
        items: []
    }
};
