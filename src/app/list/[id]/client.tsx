"use client";

import { useState } from "react";
import { GiftCard } from "@/components/features/gift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useSearchParams } from "next/navigation";
import { Gift as GiftIcon, MapPin, Calendar, Search, Filter, X, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { selectGift, cancelSelection } from "@/app/actions";
import { VISUAL_THEMES, ThemeType, BACKGROUND_PATTERNS, PatternType } from "@/lib/themes";
import { useEffect } from "react";

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
        id: string;
        guestName: string;
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
        isCashEnabled: boolean;
        quotaValues: number[];
        gifts: any[];
    };
};

export function GuestListClient({ list }: GuestListClientProps) {
    const [selectedGift, setSelectedGift] = useState<GiftWithSelection | null>(null);
    const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
    const [guestForm, setGuestForm] = useState({ name: "", contact: "", message: "", quantity: 1 });
    const [rsvpForm, setRsvpForm] = useState({ name: "", contact: "", status: "yes", message: "", adultsCount: 0, childrenCount: 0, babiesCount: 0 });
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mySelectionIds, setMySelectionIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get("payment");

    useEffect(() => {
        if (paymentStatus === "success") {
            setSuccessMessage("Pagamento confirmado com sucesso! Seu presente foi registrado.");
        } else if (paymentStatus === "failure") {
            setError("Ocorreu um erro no pagamento. Por favor, tente novamente.");
        } else if (paymentStatus === "pending") {
            setSuccessMessage("Seu pagamento está sendo processado. Assim que for confirmado, o presente será registrado.");
        }
    }, [paymentStatus]);

    useEffect(() => {
        const saved = localStorage.getItem("myGifts2Selections");
        if (saved) {
            try {
                setMySelectionIds(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading selections", e);
            }
        }
    }, []);

    const saveSelection = (id: string) => {
        const updated = [...mySelectionIds, id];
        setMySelectionIds(updated);
        localStorage.setItem("myGifts2Selections", JSON.stringify(updated));
    };

    const removeSavedSelection = (id: string) => {
        const updated = mySelectionIds.filter(sid => sid !== id);
        setMySelectionIds(updated);
        localStorage.setItem("myGifts2Selections", JSON.stringify(updated));
    };

    const calculateProgress = (gift: GiftWithSelection) => {
        const selected = gift.selections.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...gift, quantitySelected: selected, selectedBy: gift.selections };
    };

    const handleSelectGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGift) return;
        setError("");
        setLoading(true);

        const result = await selectGift(
            selectedGift.id.startsWith("quota-") ? null : selectedGift.id,
            {
                guestName: guestForm.name,
                guestContact: guestForm.contact,
                message: guestForm.message,
                quantity: Number(guestForm.quantity),
                listId: list.id,
                customAmount: selectedGift.id.startsWith("quota-") ? selectedGift.priceEstimate || 0 : undefined
            }
        );

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.selectionId) {
            saveSelection(result.selectionId);
        }

        if (result?.checkoutUrl) {
            // Redirect to Mercado Pago
            window.location.href = result.checkoutUrl;
            return;
        }

        setSuccessMessage(`Obrigado, ${guestForm.name}! Você confirmou o presente: ${selectedGift.name}.`);
        setSelectedGift(null);
        setGuestForm({ name: "", contact: "", message: "", quantity: 1 });
        setLoading(false);
    };

    const handleSelectQuota = async (amount: number) => {
        // We simulate selecting a "cash gift" by creating a temporary one or 
        // using a special ID. However, the existing selectGift expects a real giftId.
        // For simplicity, we can just suggest the user to use the existing items 
        // OR we can implement a generic "Cash Contribution" action.
        // User said: "criar automático presentes em dinheiro de 100 a 500 reais"
        // This implies these should probably BE in the gifts list.

        // I will implement a quick shortcut to select an existing gift that matches 
        // the category "Dinheiro" or "Cotas" if it exists, or just open a generic modal.

        // Let's stick to the user's "Automatic" request by injecting these into the filteredGifts 
        // or having a separate section.
    };

    const handleCancelSelection = async (selectionId: string) => {
        if (!confirm("Deseja realmente remover sua escolha deste presente?")) return;

        setLoading(true);
        const result = await cancelSelection(selectionId);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        removeSavedSelection(selectionId);
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
            message: rsvpForm.message,
            adultsCount: rsvpForm.adultsCount,
            childrenCount: rsvpForm.childrenCount,
            babiesCount: rsvpForm.babiesCount
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setSuccessMessage(`Obrigado, ${rsvpForm.name}! Sua presença foi confirmada.`);
        setIsRSVPModalOpen(false);
        setRsvpForm({ name: "", contact: "", status: "yes", message: "", adultsCount: 0, childrenCount: 0, babiesCount: 0 });
        setLoading(false);
    };

    const themeKey = (list.theme as ThemeType) || "default";
    const theme = VISUAL_THEMES[themeKey] || VISUAL_THEMES.default;

    const patternKey = (list.backgroundImageUrl as PatternType) || "none";
    const pattern = BACKGROUND_PATTERNS[patternKey] || BACKGROUND_PATTERNS.none;

    const categories = ["all", ...new Set(list.gifts.map(g => g.category))];

    const filteredGifts = list.gifts.filter(gift => {
        const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || gift.category === activeCategory;

        let matchesPrice = true;
        const price = gift.priceEstimate || 0;
        if (priceFilter === "under100") matchesPrice = price < 100;
        else if (priceFilter === "100-500") matchesPrice = price >= 100 && price <= 500;
        else if (priceFilter === "over500") matchesPrice = price > 500;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const priceRanges = [
        { label: "Qualquer preço", value: "all" },
        { label: "Até R$ 100", value: "under100" },
        { label: "R$ 100 - R$ 500", value: "100-500" },
        { label: "Acima de R$ 500", value: "over500" },
    ];

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
                            className="text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all w-full sm:w-auto"
                            style={{ backgroundColor: "#25D366" }}
                        >
                            Confirmar Presença
                        </Button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 space-y-6 animate-in fade-in duration-700">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="Buscar presente..."
                                    className="pl-10 h-12 bg-white/50 border-gray-100 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                                {priceRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => setPriceFilter(range.value)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all border ${priceFilter === range.value
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
                                            }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 mr-2 text-gray-500 text-sm font-medium">
                                <Filter className="w-4 h-4" /> Filtros:
                            </div>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${activeCategory === cat
                                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-pink-200 hover:text-pink-500'
                                        }`}
                                >
                                    {cat === "all" ? "Todos" : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {list.isCashEnabled && (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-xl">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Cotas de Presente</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {(list.quotaValues || [100, 200, 300, 500]).map((val: number) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        // We'll create a "Virtual Gift" object for the modal
                                        setSelectedGift({
                                            id: `quota-${val}`,
                                            name: `Cota de R$ ${val}`,
                                            priceEstimate: val,
                                            category: "Cota",
                                            quantityNeeded: 999,
                                            selections: [],
                                            imageUrl: null,
                                            description: "Contribuição em dinheiro para o evento.",
                                            listId: list.id,
                                            buyLink: null
                                        } as any);
                                        setGuestForm(prev => ({ ...prev, quantity: 1 }));
                                    }}
                                    className="bg-white/90 hover:bg-white p-6 rounded-3xl shadow-sm border border-blue-50 flex flex-col items-center gap-2 group transition-all hover:shadow-md hover:-translate-y-1"
                                >
                                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Cota</span>
                                    <span className="text-3xl font-extrabold text-gray-900">R$ {val}</span>
                                    <div className="mt-2 text-xs font-bold text-white bg-blue-500 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        Presentear
                                    </div>
                                </button>
                            ))}
                            {/* Custom Value Quota */}
                            <button
                                onClick={() => {
                                    const val = prompt("Qual o valor que deseja presentear?", "50");
                                    if (!val || isNaN(Number(val))) return;

                                    setSelectedGift({
                                        id: `quota-custom`,
                                        name: `Presente em Dinheiro`,
                                        priceEstimate: Number(val),
                                        category: "Cota",
                                        quantityNeeded: 1,
                                        selections: [],
                                        imageUrl: null,
                                        description: "Contribuição personalizada para o evento.",
                                        listId: list.id,
                                        buyLink: null
                                    } as any);
                                    setGuestForm(prev => ({ ...prev, quantity: 1 }));
                                }}
                                className="bg-white/90 hover:bg-white p-6 rounded-3xl shadow-sm border border-dashed border-blue-200 flex flex-col items-center gap-2 group transition-all hover:shadow-md hover:-translate-y-1"
                            >
                                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Outro Valor</span>
                                <span className="text-3xl font-extrabold text-gray-400">R$ ...</span>
                                <div className="mt-2 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                                    Definir Valor
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
                    {filteredGifts.length > 0 ? filteredGifts.map((gift) => (
                        <GiftCard
                            key={gift.id}
                            gift={calculateProgress(gift) as any}
                            isOrganizer={false}
                            primaryColor={theme.primary}
                            buttonTextColor={theme.buttonText}
                            mySelectionIds={mySelectionIds}
                            onCancelSelection={handleCancelSelection}
                            isCashEnabled={list.isCashEnabled}
                            onSelect={(g) => {
                                setSelectedGift(gift);
                                setGuestForm(prev => ({ ...prev, quantity: 1 }));
                                setError("");
                            }}
                        />
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/50">
                            <p className="text-gray-500 text-lg">Nenhum presente encontrado com esses filtros.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setPriceFilter("all"); }}
                                className="mt-4 text-pink-500 font-bold hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Selection Modal */}
                <Modal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    title={`Presentear ${selectedGift?.name}`}
                    description={list.isCashEnabled ? "Este presente será enviado em dinheiro para o organizador via Mercado Pago." : "Confirme seus dados para que o organizador saiba quem agradecer."}
                >
                    <form onSubmit={handleSelectGift} className="space-y-4">
                        {list.isCashEnabled && selectedGift?.priceEstimate && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-blue-700">Valor do Presente:</span>
                                    <span className="font-bold text-blue-900">R$ {selectedGift.priceEstimate.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-blue-600 opacity-80">
                                    <span>Taxa de Serviço (5%):</span>
                                    <span>R$ {(selectedGift.priceEstimate * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-blue-100 my-2" />
                                <div className="flex items-center justify-between font-extrabold text-blue-900">
                                    <span>Total a pagar:</span>
                                    <span>R$ {(selectedGift.priceEstimate * 1.05 * guestForm.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
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
                            <Button type="submit" disabled={loading} className="w-full text-white flex items-center justify-center gap-2" style={{ backgroundColor: theme.primary }}>
                                {loading ? "Processando..." : (list.isCashEnabled && selectedGift?.id.startsWith("quota-")) ? (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Pagar com Mercado Pago
                                    </>
                                ) : "Confirmar Escolha"}
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

                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-medium text-gray-900">Acompanhantes (sem contar você)</h3>

                            {/* Adults Counter */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Adultos</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, adultsCount: Math.max(0, prev.adultsCount - 1) }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{rsvpForm.adultsCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, adultsCount: prev.adultsCount + 1 }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Older Children Counter */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Crianças maiores</span>
                                    <span className="text-xs text-gray-500">De 6 a 10 anos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, childrenCount: Math.max(0, prev.childrenCount - 1) }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{rsvpForm.childrenCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, childrenCount: prev.childrenCount + 1 }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Babies Counter */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Crianças pequenas</span>
                                    <span className="text-xs text-gray-500">De 0 a 5 anos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, babiesCount: Math.max(0, prev.babiesCount - 1) }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{rsvpForm.babiesCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRsvpForm(prev => ({ ...prev, babiesCount: prev.babiesCount + 1 }))}
                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
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
                    title={paymentStatus === "success" ? "Pagamento Confirmado!" : "Muito Obrigado!"}
                    description={successMessage}
                >
                    <div className="flex flex-col items-center py-4 space-y-4">
                        {paymentStatus === "success" ? (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                        ) : paymentStatus === "pending" ? (
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-amber-500" />
                            </div>
                        ) : null}
                        <Button onClick={() => setSuccessMessage("")} className="w-full text-white" style={{ backgroundColor: theme.primary }}>Fechar</Button>
                    </div>
                </Modal>

                <footer className="mt-16 text-center opacity-40 text-sm" style={{ color: theme.text }}>
                    <p>Powered by Gifts2</p>
                </footer>
            </div>
        </div >
    );
}
