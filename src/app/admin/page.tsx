import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
    const session = await getSession();
    if (!session || !session.userId) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || user.email !== adminEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
                    <p className="text-gray-500">Esta área é restrita para administradores da plataforma.</p>
                </div>
            </div>
        );
    }

    // Fetch pending withdrawal requests
    const requests = await (prisma as any).withdrawalRequest.findMany({
        where: { status: "PENDING" },
        include: {
            list: {
                select: {
                    title: true,
                    organizerName: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return <AdminDashboardClient requests={requests} />;
}
