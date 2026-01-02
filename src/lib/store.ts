import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GiftList, Gift, EventType } from './types';
import { GIFT_TEMPLATES } from './templates';
import { nanoid } from 'nanoid';

interface AppState {
    lists: GiftList[];
    createList: (data: {
        eventType: EventType;
        organizerName: string;
        eventDate: string;
        title: string;
        location?: string;
    }) => string; // Returns the new List ID
    getList: (id: string) => GiftList | undefined;
    updateGift: (listId: string, giftId: string, updates: Partial<Gift>) => void;
    addGift: (listId: string, gift: Omit<Gift, "id" | "quantitySelected" | "selectedBy">) => void;
    removeGift: (listId: string, giftId: string) => void;
    selectGift: (listId: string, giftId: string, quantity: number, guestName: string, guestContact?: string, message?: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            lists: [],

            createList: ({ eventType, organizerName, eventDate, title, location }) => {
                const template = GIFT_TEMPLATES[eventType] || GIFT_TEMPLATES.other;
                const id = nanoid();
                const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(4)}`;

                const initialGifts: Gift[] = template.items.map(item => ({
                    ...item,
                    id: nanoid(),
                    quantitySelected: 0,
                    selectedBy: []
                }));

                const newList: GiftList = {
                    id,
                    slug,
                    title,
                    organizerName,
                    eventType,
                    eventDate,
                    location,
                    gifts: initialGifts,
                    createdAt: new Date().toISOString(),
                };

                set(state => ({ lists: [...state.lists, newList] }));
                return id;
            },

            getList: (id) => get().lists.find(l => l.id === id || l.slug === id),

            updateGift: (listId, giftId, updates) =>
                set(state => ({
                    lists: state.lists.map(list =>
                        list.id === listId
                            ? { ...list, gifts: list.gifts.map(g => g.id === giftId ? { ...g, ...updates } : g) }
                            : list
                    )
                })),

            addGift: (listId, giftData) =>
                set(state => ({
                    lists: state.lists.map(list =>
                        list.id === listId
                            ? { ...list, gifts: [...list.gifts, { ...giftData, id: nanoid(), quantitySelected: 0, selectedBy: [] }] }
                            : list
                    )
                })),

            removeGift: (listId, giftId) =>
                set(state => ({
                    lists: state.lists.map(list =>
                        list.id === listId
                            ? { ...list, gifts: list.gifts.filter(g => g.id !== giftId) }
                            : list
                    )
                })),

            selectGift: (listId, giftId, quantity, guestName, guestContact, message) =>
                set(state => ({
                    lists: state.lists.map(list => {
                        if (list.id !== listId) return list;

                        return {
                            ...list,
                            gifts: list.gifts.map(gift => {
                                if (gift.id !== giftId) return gift;

                                return {
                                    ...gift,
                                    quantitySelected: gift.quantitySelected + quantity,
                                    selectedBy: [
                                        ...(gift.selectedBy || []),
                                        { guestName, guestContact, quantity, message }
                                    ]
                                };
                            })
                        };
                    })
                }))
        }),
        {
            name: 'gifts2-storage',
        }
    )
);
