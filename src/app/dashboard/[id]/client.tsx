"use client";

import { useState } from "react";
import { GiftCard } from "@/components/features/gift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Share2, LayoutDashboard, Camera, Image as ImageIcon, Loader2, Eye, MessageSquareHeart, UserCheck, Calendar, Wallet, Check, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { addGift, updateGift, deleteGift, updateListFinance, requestWithdrawal } from "@/app/actions";
import { resizeImage } from "@/lib/images";
import Link from "next/link";

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

type Attendance = {
    id: string;
    guestName: string;
    guestContact: string | null;
    status: string;
    message: string | null;
    companionName: string | null;
    hasChildren: boolean;
    createdAt: Date;
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
        coverImageUrl: string | null;
        isCashEnabled: boolean;
        quotaValues: number[];
        gifts: GiftWithSelection[];
        attendances: Attendance[];
    };
};

export function DashboardClient({ list }: DashboardClientProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<GiftWithSelection | null>(null);
    const [activeTab, setActiveTab] = useState<"gifts" | "attendances" | "mural" | "finance">("gifts");

    const [financeForm, setFinanceForm] = useState({
        isCashEnabled: list.isCashEnabled,
        quotaValues: list.quotaValues || [100, 200, 300, 500]
    });
    const [withdrawalForm, setWithdrawalForm] = useState({
        amount: "",
        pixKey: "",
    });
    const [isWithdrawalLoading, setIsWithdrawalLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [giftForm, setGiftForm] = useState({ name: "", category: "", quantityNeeded: 1, priceEstimate: 0, imageUrl: "", description: "" });
    const [isUploading, setIsUploading] = useState(false);

    const handleGiftImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const compressedBase64 = await resizeImage(file);
            setGiftForm(prev => ({ ...prev, imageUrl: compressedBase64 }));
        } catch (error) {
            console.error("Error uploading gift image:", error);
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploading(false);
        }
    };

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

    const handleUpdateFinance = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateListFinance(list.id, financeForm);
            alert("Configurações financeiras atualizadas!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar configurações.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawalForm.amount || Number(withdrawalForm.amount) <= 0) {
            alert("Informe um valor válido para o saque.");
            return;
        }
        setIsWithdrawalLoading(true);
        try {
            const result = await requestWithdrawal(list.id, {
                amount: Number(withdrawalForm.amount),
                pixKey: withdrawalForm.pixKey
            });
            if (result.error) {
                alert(result.error);
            } else {
                alert("Solicitação de saque enviada com sucesso! Você receberá o valor em breve.");
                setWithdrawalForm({ amount: "", pixKey: "" });
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao solicitar saque.");
        } finally {
            setIsWithdrawalLoading(false);
        }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {list.coverImageUrl ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm bg-pink-50 flex-shrink-0">
                            <img src={list.coverImageUrl} alt={list.title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center flex-shrink-0 text-pink-500">
                            <LayoutDashboard className="w-10 h-10" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 text-sm text-pink-500 font-medium mb-1">
                            <LayoutDashboard className="w-4 h-4" /> Painel do Organizador
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{list.title}</h1>
                        <p className="text-gray-500 mt-1">
                            {list.eventDate} • {list.location} • {fulfilledCount} / {list.gifts.length} itens conquistados
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                        <Share2 className="w-4 h-4" /> Link
                    </Button>
                    <Button variant="outline" className="gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] border-none" onClick={() => {
                        const url = `${window.location.origin}/list/${list.slug}`;
                        const text = encodeURIComponent(`Confira minha lista de presentes "${list.title}" no Gifts2: ${url}`);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}>
                        <Share2 className="w-4 h-4" /> WhatsApp
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`/list/${list.slug}`, '_blank')} className="gap-2 text-pink-600 border-pink-100 hover:bg-pink-50">
                        <Eye className="w-4 h-4" /> Ver como convidado
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Adicionar Presente
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8 gap-8">
                <button
                    onClick={() => setActiveTab("gifts")}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "gifts" ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Presentes ({list.gifts.length})
                    {activeTab === "gifts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
                </button>
                <button
                    onClick={() => setActiveTab("attendances")}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "attendances" ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Convidados ({list.attendances.length})
                    {activeTab === "attendances" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
                </button>
                <button
                    onClick={() => setActiveTab("mural")}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "mural" ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Mural de Recados
                    {activeTab === "mural" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
                </button>
                <button
                    onClick={() => setActiveTab("finance")}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "finance" ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Financeiro
                    {activeTab === "finance" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
                </button>
            </div>

            {activeTab === "gifts" ? (
                <>
                    {/* Grid Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.gifts.map((gift) => (
                            <div key={gift.id} className="h-full">
                                <GiftCard
                                    gift={calculateProgress(gift) as any}
                                    isOrganizer={true}
                                    onDelete={async (id) => await deleteGift(id)}
                                    onEdit={openEditModal}
                                    isCashEnabled={list.isCashEnabled}
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Presentes Escolhidos</h2>
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
                </>
            ) : activeTab === "attendances" ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <span className="text-green-600 text-sm font-bold uppercase">Confirmados</span>
                            <p className="text-3xl font-bold text-green-700 mt-1">{list.attendances.filter(a => a.status === 'yes').length}</p>
                        </div>
                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                            <span className="text-yellow-600 text-sm font-bold uppercase">Em Dúvida</span>
                            <p className="text-3xl font-bold text-yellow-700 mt-1">{list.attendances.filter(a => a.status === 'maybe').length}</p>
                        </div>
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <span className="text-red-600 text-sm font-bold uppercase">Não Irão</span>
                            <p className="text-3xl font-bold text-red-700 mt-1">{list.attendances.filter(a => a.status === 'no').length}</p>
                        </div>
                    </div>

                    {list.attendances.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Nome</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Acompanhante</th>
                                            <th className="px-6 py-4 text-center">Filhos?</th>
                                            <th className="px-6 py-4">Mensagem</th>
                                            <th className="px-6 py-4">Contato</th>
                                            <th className="px-6 py-4">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {list.attendances.map((att) => (
                                            <tr key={att.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-bold text-gray-800">{att.guestName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${att.status === 'yes' ? 'bg-green-100 text-green-700' :
                                                        att.status === 'no' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {att.status === 'yes' ? 'Vou' : att.status === 'no' ? 'Não vou' : 'Talvez'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{att.companionName || "-"}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {att.hasChildren ? (
                                                        <span className="text-pink-600 font-bold">Sim</span>
                                                    ) : (
                                                        <span className="text-gray-400">Não</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 italic">{att.message || "-"}</td>
                                                <td className="px-6 py-4">{att.guestContact || "-"}</td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {new Date(att.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400">Ainda não há confirmações de presença.</p>
                        </div>
                    )}
                </div>
            ) : activeTab === "finance" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status Card */}
                        <div className="md:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-xl ${financeForm.isCashEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Status Geral</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Controle se sua lista aceita presentes em dinheiro.</p>
                            </div>

                            <button
                                onClick={() => {
                                    const newValue = !financeForm.isCashEnabled;
                                    setFinanceForm({ ...financeForm, isCashEnabled: newValue });
                                    updateListFinance(list.id, { isCashEnabled: newValue });
                                }}
                                className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${financeForm.isCashEnabled
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {financeForm.isCashEnabled ? (
                                    <><Check className="w-5 h-5" /> Ativo</>
                                ) : (
                                    'Ativar Recebimento'
                                )}
                            </button>
                        </div>

                        {/* Balance Card */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Wallet className="w-32 h-32" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <p className="text-blue-100 font-medium mb-1">Saldo Disponível</p>
                                    <h2 className="text-5xl font-extrabold mb-8">
                                        R$ {(list as any).balance?.toFixed(2) || "0.00"}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-blue-100 text-xs uppercase font-bold tracking-wider mb-1">Total Recebido</p>
                                        <p className="text-xl font-bold">R$ {list.gifts.reduce((acc, g) => acc + g.selections.filter(s => (s as any).paymentStatus === "PAID").reduce((sum, s) => sum + (g.priceEstimate || 0) * s.quantity, 0), 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-200 text-xs opacity-60 leading-tight">
                                            O valor disponível já considera a taxa de serviço de 5%.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quota Values Config - NEW CARD */}
                        {financeForm.isCashEnabled && (
                            <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Valores das Cotas</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        Personalize os 4 valores de presentes em dinheiro sugeridos aos seus convidados.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
                                        {financeForm.quotaValues.map((val, idx) => (
                                            <div key={idx} className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-8 pr-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                                    value={val}
                                                    onChange={(e) => {
                                                        const newValues = [...financeForm.quotaValues];
                                                        newValues[idx] = Number(e.target.value);
                                                        setFinanceForm({ ...financeForm, quotaValues: newValues });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => updateListFinance(list.id, financeForm)}
                                        className="h-12 px-6 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Withdrawal Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-500" />
                                Solicitar Saque
                            </h3>

                            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Valor do Saque</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={withdrawalForm.amount}
                                        onChange={e => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                                        className="bg-gray-50 border-gray-100 rounded-xl h-12"
                                        max={(list as any).balance}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Chave PIX</label>
                                    <Input
                                        placeholder="CPF, Email, Celular ou Aleatória"
                                        value={withdrawalForm.pixKey}
                                        onChange={e => setWithdrawalForm({ ...withdrawalForm, pixKey: e.target.value })}
                                        className="bg-gray-50 border-gray-100 rounded-xl h-12"
                                    />
                                </div>
                                <Button
                                    disabled={isWithdrawalLoading || !(list as any).balance || (list as any).balance <= 0}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold mt-4"
                                >
                                    {isWithdrawalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Solicitar Saque"}
                                </Button>
                            </form>
                        </div>

                        {/* Info Section */}
                        <div className="bg-blue-50 rounded-3xl border border-blue-100 p-8">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <span>🛡️</span> Segurança e Prazos
                            </h3>
                            <ul className="space-y-4 text-sm text-blue-800">
                                <li className="flex gap-3">
                                    <span className="font-bold">1.</span>
                                    <p>Os pagamentos são processados via <strong>Mercado Pago</strong> (Gifts2 Oficial) para garantir segurança total para seus convidados.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold">2.</span>
                                    <p>As solicitações de saque são processadas em até <strong>24 horas úteis</strong> após o pedido.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold">3.</span>
                                    <p>Nosso suporte está disponível 24h para ajudar com qualquer dúvida sobre sua carteira.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-pink-100 p-3 rounded-full">
                            <MessageSquareHeart className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Mural de Carinho</h2>
                            <p className="text-gray-500">Recados deixados pelos seus convidados ao escolher um presente.</p>
                        </div>
                    </div>

                    {list.gifts.some(g => g.selections.some(s => s.message)) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {list.gifts.flatMap(gift =>
                                gift.selections.filter(s => s.message).map((selection, idx) => (
                                    <div key={`${gift.id}-${idx}`} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <MessageSquareHeart className="w-12 h-12 text-pink-500" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-pink-50 p-2 rounded-full">
                                                <UserCheck className="w-4 h-4 text-pink-500" />
                                            </div>
                                            <span className="font-bold text-gray-900">{selection.guestName}</span>
                                        </div>
                                        <p className="text-gray-700 italic leading-relaxed mb-4 relative z-10">
                                            "{selection.message}"
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-top border-gray-50">
                                            <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded-md">
                                                🎁 {gift.name}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <MessageSquareHeart className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 max-w-sm">
                                As mensagens que seus convidados deixarem ao escolher um presente aparecerão aqui. Compartilhe sua lista!
                            </p>
                        </div>
                    )}
                </div>
            )}

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
                        <label className="text-sm font-medium">Imagem do Presente</label>
                        <div className="relative flex flex-col items-center gap-4 p-6 border-2 border-dashed border-pink-100 rounded-2xl bg-pink-50/30 group hover:border-pink-300 transition-colors">
                            {giftForm.imageUrl ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md">
                                    <img src={giftForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setGiftForm({ ...giftForm, imageUrl: "" })}
                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:text-red-700 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                        {isUploading ? <Loader2 className="w-8 h-8 text-pink-500 animate-spin" /> : <Camera className="w-8 h-8 text-pink-500" />}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Clique para subir uma foto</p>
                                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG ou JPEG</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleGiftImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                        </div>
                        <div className="pt-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold px-1 mb-1">Ou cole uma URL da imagem</p>
                            <Input
                                value={giftForm.imageUrl}
                                onChange={e => setGiftForm({ ...giftForm, imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="text-xs h-9"
                            />
                        </div>
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
                        <label className="text-sm font-medium">Imagem do Presente</label>
                        <div className="relative flex flex-col items-center gap-4 p-6 border-2 border-dashed border-pink-100 rounded-2xl bg-pink-50/30 group hover:border-pink-300 transition-colors">
                            {giftForm.imageUrl ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md">
                                    <img src={giftForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setGiftForm({ ...giftForm, imageUrl: "" })}
                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:text-red-700 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                        {isUploading ? <Loader2 className="w-8 h-8 text-pink-500 animate-spin" /> : <Camera className="w-8 h-8 text-pink-500" />}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Clique para subir uma foto</p>
                                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG ou JPEG</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleGiftImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                        </div>
                        <div className="pt-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold px-1 mb-1">Ou cole uma URL da imagem</p>
                            <Input
                                value={giftForm.imageUrl}
                                onChange={e => setGiftForm({ ...giftForm, imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="text-xs h-9"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full">Salvar Alterações</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
