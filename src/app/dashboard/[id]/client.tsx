"use client";

import { useState } from "react";
import { GiftCard } from "@/components/features/gift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Share2, LayoutDashboard } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { addGift, updateGift, deleteGift } from "@/app/actions";

// We define a local type that matches the Prisma payload including selections
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
        message: string | null;
        guestContact: string | null;
    }[];
    createdAt: Date;
    updatedAt: Date;
};

type DashboardClientProps = {
    id: string;
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

export function DashboardClient({ list }: DashboardClientProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<GiftWithSelection | null>(null);

    // Form state
    const [giftForm, setGiftForm] = useState({ name: "", category: "", quantityNeeded: 1, priceEstimate: 0, imageUrl: "", description: "" });

    const handleCopyLink = () => {
        const url = `${window.location.origin}/list/${list.slug}`;
        navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
    };

    const handleAddGift = async (e: React.FormEvent) => {
        e.preventDefault();
        await addGift(list.id, {
            name: giftForm.name,
            category: giftForm.category || "Geral",
            quantityNeeded: Number(giftForm.quantityNeeded),
            priceEstimate: Number(giftForm.priceEstimate),
            imageUrl: giftForm.imageUrl,
            description: giftForm.description,
        });

        setIsAddModalOpen(false);
        setGiftForm({ name: "", category: "", quantityNeeded: 1, priceEstimate: 0, imageUrl: "", description: "" });
    };

    const handleUpdateGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGift) return;

        await updateGift(editingGift.id, {
            name: giftForm.name,
            category: giftForm.category,
            quantityNeeded: Number(giftForm.quantityNeeded),
            priceEstimate: Number(giftForm.priceEstimate),
            imageUrl: giftForm.imageUrl,
            description: giftForm.description
        });
        setEditingGift(null);
        setGiftForm({ name: "", category: "", quantityNeeded: 1, priceEstimate: 0, imageUrl: "", description: "" });
    };

    // Helper to map Prisma gift to UI Gift type or just use it directly
    // The GiftCard component expects `Gift` interface from `@/lib/types`. 
    // We should align types or map them.
    // The local `Gift` interface has `quantitySelected`. Prisma uses `selections` relation.
    // We calculate quantitySelected locally.

    const calculateProgress = (gift: GiftWithSelection) => {
        const selected = gift.selections.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...gift, quantitySelected: selected, selectedBy: gift.selections };
    };

    const openEditModal = (gift: any) => {
        setEditingGift(gift);
        setGiftForm({
            name: gift.name,
            category: gift.category,
            quantityNeeded: gift.quantityNeeded,
            priceEstimate: gift.priceEstimate || 0,
            imageUrl: gift.imageUrl || "",
            description: gift.description || ""
        });
    };

    const fulfilledCount = list.gifts.filter(g => {
        const total = g.selections.reduce((acc, s) => acc + s.quantity, 0);
        return total >= g.quantityNeeded;
    }).length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
                <div>
                    <div className="flex items-center gap-2 text-sm text-pink-500 font-medium mb-1">
                        <LayoutDashboard className="w-4 h-4" /> Painel do Organizador
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{list.title}</h1>
                    <p className="text-gray-500 mt-1">
                        {list.eventDate} • {list.location} • {fulfilledCount} / {list.gifts.length} itens conquistados
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                        <Share2 className="w-4 h-4" /> Compartilhar Link
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Adicionar Presente
                    </Button>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {list.gifts.map((gift) => (
                    <div key={gift.id} className="h-full">
                        <GiftCard
                            gift={calculateProgress(gift) as any}
                            isOrganizer={true}
                            onDelete={async (id) => await deleteGift(id)}
                            onEdit={openEditModal}
                        />
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50/50 transition-all group"
                >
                    <div className="bg-gray-100 group-hover:bg-pink-100 p-4 rounded-full mb-3 transition-colors">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-medium">Adicionar Novo Presente</span>
                </button>
            </div>

            {/* Guest Tracking Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Lista de Convidados & Mensagens</h2>
                {list.gifts.some(g => g.selections.length > 0) ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Presente</th>
                                        <th className="px-6 py-4">Convidado</th>
                                        <th className="px-6 py-4">Qtd.</th>
                                        <th className="px-6 py-4">Mensagem</th>
                                        <th className="px-6 py-4">Contato</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {list.gifts.filter(g => g.selections.length > 0).flatMap(gift =>
                                        gift.selections.map((selection, idx) => (
                                            <tr key={`${gift.id}-${idx}`} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{gift.name}</td>
                                                <td className="px-6 py-4">{selection.guestName}</td>
                                                <td className="px-6 py-4">{selection.quantity}</td>
                                                <td className="px-6 py-4 italic">{selection.message || "-"}</td>
                                                <td className="px-6 py-4">{selection.guestContact || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400">Nenhum presente selecionado ainda. Compartilhe sua lista para começar!</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Adicionar Novo Presente"
                description="Adicione um novo item à sua lista de desejos."
            >
                <form onSubmit={handleAddGift} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do Presente</label>
                        <Input required value={giftForm.name} onChange={e => setGiftForm({ ...giftForm, name: e.target.value })} placeholder="ex: Cafeteira Expresso" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoria</label>
                            <Input value={giftForm.category} onChange={e => setGiftForm({ ...giftForm, category: e.target.value })} placeholder="Cozinha" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantidade</label>
                            <Input type="number" min="1" value={giftForm.quantityNeeded} onChange={e => setGiftForm({ ...giftForm, quantityNeeded: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição (Opcional)</label>
                        <Input value={giftForm.description} onChange={e => setGiftForm({ ...giftForm, description: e.target.value })} placeholder="Cor específica, modelo..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">URL da Imagem (Opcional)</label>
                        <Input value={giftForm.imageUrl} onChange={e => setGiftForm({ ...giftForm, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full">Adicionar Presente</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingGift}
                onClose={() => { setEditingGift(null); setGiftForm({ name: "", category: "", quantityNeeded: 1, priceEstimate: 0, imageUrl: "", description: "" }); }}
                title="Editar Presente"
                description="Atualize os detalhes deste presente."
            >
                <form onSubmit={handleUpdateGift} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do Presente</label>
                        <Input required value={giftForm.name} onChange={e => setGiftForm({ ...giftForm, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoria</label>
                            <Input value={giftForm.category} onChange={e => setGiftForm({ ...giftForm, category: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantidade</label>
                            <Input type="number" min="1" value={giftForm.quantityNeeded} onChange={e => setGiftForm({ ...giftForm, quantityNeeded: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição (Opcional)</label>
                        <Input value={giftForm.description} onChange={e => setGiftForm({ ...giftForm, description: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">URL da Imagem (Opcional)</label>
                        <Input value={giftForm.imageUrl} onChange={e => setGiftForm({ ...giftForm, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full">Salvar Alterações</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
