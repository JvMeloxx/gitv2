"use client";

import { useState } from "react";
import { GiftCard } from "@/components/features/gift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Gift as GiftIcon, MapPin, Calendar } from "lucide-react";
import { selectGift } from "@/app/actions";
import { VISUAL_THEMES, ThemeType, BACKGROUND_PATTERNS, PatternType } from "@/lib/themes";

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
        coverImageUrl: string | null;
        theme: string;
        backgroundImageUrl: string | null;
        gifts: GiftWithSelection[];
    };
};

export function GuestListClient({ list }: GuestListClientProps) {
    const [selectedGift, setSelectedGift] = useState<GiftWithSelection | null>(null);
    const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
    const [guestForm, setGuestForm] = useState({ name: "", contact: "", message: "", quantity: 1 });
    const [rsvpForm, setRsvpForm] = useState({ name: "", contact: "", status: "yes", message: "" });
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const calculateProgress = (gift: GiftWithSelection) => {
        const selected = gift.selections.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...gift, quantitySelected: selected, selectedBy: gift.selections };
    };

    const handleSelectGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGift) return;
        setError("");
        setLoading(true);

        const result = await selectGift(selectedGift.id, {
            guestName: guestForm.name,
            guestContact: guestForm.contact,
            message: guestForm.message,
            quantity: guestForm.quantity
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setSuccessMessage(`Obrigado, ${guestForm.name}! Você confirmou o presente: ${selectedGift.name}.`);
        setSelectedGift(null);
        setGuestForm({ name: "", contact: "", message: "", quantity: 1 });
        setLoading(false);
    };

    const handleRSVP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { submitRSVP } = await import("@/app/actions");
        const result = await submitRSVP(list.id, {
            guestName: rsvpForm.name,
            guestContact: rsvpForm.contact,
            status: rsvpForm.status,
            message: rsvpForm.message
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setSuccessMessage(`Obrigado, ${rsvpForm.name}! Sua presença foi confirmada.`);
        setIsRSVPModalOpen(false);
        setRsvpForm({ name: "", contact: "", status: "yes", message: "" });
        setLoading(false);
    };

    const themeKey = (list.theme as ThemeType) || "default";
    const theme = VISUAL_THEMES[themeKey] || VISUAL_THEMES.default;

    const patternKey = (list.backgroundImageUrl as PatternType) || "none";
    const pattern = BACKGROUND_PATTERNS[patternKey] || BACKGROUND_PATTERNS.none;

    return (
        <div className="min-h-screen relative transition-colors duration-500" style={{ backgroundColor: theme.background }}>
            {/* Curated Fixed Background Pattern */}
            {patternKey !== "none" && (
                <div
                    className="fixed inset-0 z-0 pointer-events-none opacity-40 shadow-inner"
                    style={pattern.style}
                />
            )}

            <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center mb-2">
                        {list.coverImageUrl ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex-shrink-0">
                                <img
                                    src={list.coverImageUrl}
                                    alt={list.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="p-4 rounded-full" style={{ backgroundColor: `${theme.primary}15` }}>
                                <GiftIcon className="w-10 h-10" style={{ color: theme.primary }} />
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: theme.text }}>{list.title}</h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-80" style={{ color: theme.text }}>
                        <span className="flex items-center gap-2 font-medium"><Calendar className="w-4 h-4" /> {list.eventDate}</span>
                        {list.location && <span className="flex items-center gap-2 font-medium"><MapPin className="w-4 h-4" /> {list.location}</span>}
                    </div>
                    <p className="text-lg max-w-2xl mx-auto opacity-70" style={{ color: theme.text }}>
                        Organizado por {list.organizerName}. Escolha um presente para tornar o dia deles especial!
                    </p>
                    <div className="pt-4 pb-8">
                        <Button
                            onClick={() => setIsRSVPModalOpen(true)}
                            className="text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                            style={{ backgroundColor: "#25D366" }}
                        >
                            Confirmar Presença
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {list.gifts.map((gift) => (
                        <GiftCard
                            key={gift.id}
                            gift={calculateProgress(gift) as any}
                            isOrganizer={false}
                            primaryColor={theme.primary}
                            buttonTextColor={theme.buttonText}
                            onSelect={(g) => {
                                setSelectedGift(gift);
                                setGuestForm(prev => ({ ...prev, quantity: 1 }));
                                setError("");
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

                        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

                        <div className="pt-2">
                            <Button type="submit" disabled={loading} className="w-full text-white" style={{ backgroundColor: theme.primary }}>
                                {loading ? "Confirmando..." : "Confirmar Escolha"}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* RSVP Modal */}
                <Modal
                    isOpen={isRSVPModalOpen}
                    onClose={() => setIsRSVPModalOpen(false)}
                    title="Confirmar Presença"
                    description="Informe se você poderá comparecer ao evento."
                >
                    <form onSubmit={handleRSVP} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Seu Nome (Obrigatório)</label>
                            <Input required value={rsvpForm.name} onChange={e => setRsvpForm({ ...rsvpForm, name: e.target.value })} placeholder="ex: João Silva" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contato (Opcional)</label>
                            <Input value={rsvpForm.contact} onChange={e => setRsvpForm({ ...rsvpForm, contact: e.target.value })} placeholder="Email ou Telefone" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Você poderá ir?</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2"
                                value={rsvpForm.status}
                                onChange={e => setRsvpForm({ ...rsvpForm, status: e.target.value })}
                            >
                                <option value="yes">Sim, eu vou!</option>
                                <option value="maybe">Ainda não sei</option>
                                <option value="no">Não poderei ir</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mensagem para os anfitriões (Opcional)</label>
                            <Input value={rsvpForm.message} onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })} placeholder="Felicidades!" />
                        </div>

                        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

                        <div className="pt-2">
                            <Button type="submit" disabled={loading} className="w-full text-white" style={{ backgroundColor: theme.primary }}>
                                {loading ? "Enviando..." : "Confirmar Presença"}
                            </Button>
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
                        <Button onClick={() => setSuccessMessage("")} className="w-full text-white" style={{ backgroundColor: theme.primary }}>Fechar</Button>
                    </div>
                </Modal>

                <footer className="mt-16 text-center opacity-40 text-sm" style={{ color: theme.text }}>
                    <p>Powered by Gifts2</p>
                </footer>
            </div>
        </div>
    );
}
