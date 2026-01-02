"use client";

import { useState } from "react";
import { GiftCard } from "@/components/features/gift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Gift as GiftIcon, MapPin, Calendar } from "lucide-react";
import { selectGift } from "@/app/actions";

// Match Prisma type
type GiftWithSelection = {
    id: string;
    listId: string;
    name: string;
    category: string;
    description: string | null;
    imageUrl: string | null;
    priceEstimate: number | null;
    buyLink: string | null;
    quantityNeeded: number;
    selections: {
        quantity: number;
    }[];
};

type GuestListClientProps = {
    list: {
        id: string;
        slug: string;
        title: string;
        organizerName: string;
        eventDate: string;
        location: string | null;
        gifts: GiftWithSelection[];
    };
};

export function GuestListClient({ list }: GuestListClientProps) {
    const [selectedGift, setSelectedGift] = useState<GiftWithSelection | null>(null);
    const [guestForm, setGuestForm] = useState({ name: "", contact: "", message: "", quantity: 1 });
    const [successMessage, setSuccessMessage] = useState("");

    const calculateProgress = (gift: GiftWithSelection) => {
        const selected = gift.selections.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...gift, quantitySelected: selected, selectedBy: gift.selections };
    };

    const handleSelectGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGift) return;

        await selectGift(selectedGift.id, {
            guestName: guestForm.name,
            guestContact: guestForm.contact,
            message: guestForm.message,
            quantity: guestForm.quantity
        });

        setSuccessMessage(`Obrigado, ${guestForm.name}! Você confirmou o presente: ${selectedGift.name}.`);
        setSelectedGift(null);
        setGuestForm({ name: "", contact: "", message: "", quantity: 1 });
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-pink-100/50 rounded-full mb-2">
                    <GiftIcon className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{list.title}</h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {list.eventDate}</span>
                    {list.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {list.location}</span>}
                </div>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Organizado por {list.organizerName}. Escolha um presente para tornar o dia deles especial!
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {list.gifts.map((gift) => (
                    <GiftCard
                        key={gift.id}
                        gift={calculateProgress(gift) as any}
                        isOrganizer={false}
                        onSelect={(g) => {
                            // We pass generic gift to onSelect, but set typed version
                            setSelectedGift(gift);
                            setGuestForm(prev => ({ ...prev, quantity: 1 }));
                        }}
                    />
                ))}
            </div>

            {/* Selection Modal */}
            <Modal
                isOpen={!!selectedGift}
                onClose={() => setSelectedGift(null)}
                title={`Presentear ${selectedGift?.name}`}
                description="Confirme seus dados para que o organizador saiba quem agradecer."
            >
                <form onSubmit={handleSelectGift} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Seu Nome (Obrigatório)</label>
                        <Input required value={guestForm.name} onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} placeholder="ex: Tia Maria" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contato (Email/WhatsApp - Opcional)</label>
                        <Input value={guestForm.contact} onChange={e => setGuestForm({ ...guestForm, contact: e.target.value })} />
                    </div>

                    {selectedGift && (
                        (() => {
                            const stats = calculateProgress(selectedGift);
                            const remaining = stats.quantityNeeded - stats.quantitySelected;
                            if (remaining > 1) {
                                return (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Quantidade (Máx: {remaining})</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={remaining}
                                            value={guestForm.quantity}
                                            onChange={e => setGuestForm({ ...guestForm, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mensagem (Opcional)</label>
                        <Input value={guestForm.message} onChange={e => setGuestForm({ ...guestForm, message: e.target.value })} placeholder="Felicidades!" />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">Confirmar Escolha</Button>
                    </div>
                </form>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage("")}
                title="Muito Obrigado!"
                description={successMessage}
            >
                <div className="flex justify-center py-4">
                    <Button onClick={() => setSuccessMessage("")} className="w-full">Fechar</Button>
                </div>
            </Modal>

            <footer className="mt-16 text-center text-gray-400 text-sm">
                <p>Powered by Gifts2</p>
            </footer>
        </div>
    );
}
