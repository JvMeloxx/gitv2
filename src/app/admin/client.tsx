"use client";

import { useState } from "react";
import { approveWithdrawal, rejectWithdrawal } from "@/app/actions";
import { Button } from "@/components/ui/button";

type WithdrawalRequest = {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    pixKey: string | null;
    bankDetails: string | null;
    list: {
        title: string;
        organizerName: string;
    };
};

export function AdminDashboardClient({ requests }: { requests: WithdrawalRequest[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        if (!confirm("Confirmar transferência PIX realizada?")) return;
        setLoadingId(id);
        await approveWithdrawal(id);
        setLoadingId(null);
    };

    const handleReject = async (id: string) => {
        if (!confirm("Rejeitar solicitação?")) return;
        setLoadingId(id);
        await rejectWithdrawal(id);
        setLoadingId(null);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Solicitações Pendentes</h3>
                    <p className="text-4xl font-bold mt-2">{requests.length}</p>
                </div>
                {/* Placeholder stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-50">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Volume Total</h3>
                    <p className="text-4xl font-bold mt-2">R$ ---</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-50">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Receita (5%)</h3>
                    <p className="text-4xl font-bold mt-2">R$ ---</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Solicitações de Saque</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Data</th>
                                <th className="p-4 font-medium text-gray-500">Organizador / Lista</th>
                                <th className="p-4 font-medium text-gray-500">Dados PIX</th>
                                <th className="p-4 font-medium text-gray-500">Valor</th>
                                <th className="p-4 font-medium text-gray-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Nenhuma solicitação pendente.
                                    </td>
                                </tr>
                            ) : requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="p-4 whitespace-nowrap">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium">{req.list.organizerName}</div>
                                        <div className="text-gray-500 text-xs">{req.list.title}</div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-600">
                                        {req.pixKey || req.bankDetails || "N/A"}
                                    </td>
                                    <td className="p-4 font-bold text-green-600">
                                        R$ {req.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button
                                            onClick={() => handleReject(req.id)}
                                            disabled={loadingId === req.id}
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Rejeitar
                                        </Button>
                                        <Button
                                            onClick={() => handleApprove(req.id)}
                                            disabled={loadingId === req.id}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            {loadingId === req.id ? "..." : "Aprovar PIX"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
