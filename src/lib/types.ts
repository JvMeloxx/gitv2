export type EventType =
    | "wedding"
    | "baby_shower"
    | "housewarming"
    | "birthday"
    | "other";

export interface Gift {
    id: string;
    name: string;
    category: string;
    description?: string;
    imageUrl?: string;
    priceEstimate?: number; // Optional reference price
    buyLink?: string;
    quantityNeeded: number;
    quantitySelected: number;
    selectedBy?: GuestSelection[];
}

export interface GuestSelection {
    guestName: string;
    guestContact?: string;
    quantity: number;
    message?: string;
}

export interface GiftList {
    id: string;
    slug: string; // Unique URL identifier
    title: string;
    organizerName: string;
    eventType: EventType;
    eventDate: string;
    location?: string;
    gifts: Gift[];
    createdAt: string;
}

export interface GiftTemplate {
    name: string;
    items: Omit<Gift, "id" | "quantitySelected" | "selectedBy">[];
}
