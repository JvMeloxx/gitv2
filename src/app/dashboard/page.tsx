import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Gift, Calendar, MapPin, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const lists = await prisma.giftList.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { gifts: true }
    });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name}</h1>
                        <p className="text-gray-500 mt-1">Gerencie suas listas de presentes.</p>
                    </div>
                    <Button asChild className="gap-2 shadow-lg shadow-pink-200">
                        <Link href="/create">
                            <Plus className="w-4 h-4" /> Nova Lista
                        </Link>
                    </Button>
                </div>

                {lists.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                        <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Você ainda não tem listas</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Crie sua primeira lista para casamentos, aniversários ou qualquer ocasião especial.</p>
                        <Button asChild variant="outline">
                            <Link href="/create">Começar Agora</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map((list) => {
                            const fulfilledCount = list.gifts.filter(g => {
                                // We don't have selections included here to save bandwidth, 
                                // but we could include them if we want accurate progress.
                                // For the dashboard card, maybe just showing item count is enough.
                                return false; // Placeholder if we don't fetch selections
                            }).length;

                            return (
                                <Card key={list.id} className="hover:shadow-md transition-shadow group flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                                {list.eventType === 'wedding' ? 'Casamento' :
                                                    list.eventType === 'baby_shower' ? 'Chá de Bebê' :
                                                        list.eventType === 'housewarming' ? 'Chá de Casa Nova' :
                                                            list.eventType === 'birthday' ? 'Aniversário' : 'Outro'}
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">
                                            {list.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1">
                                            {list.location || "Local não definido"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="space-y-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{list.eventDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Gift className="w-4 h-4" />
                                                <span>{list.gifts.length} presentes listados</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t border-gray-100">
                                        <Button asChild variant="ghost" className="w-full justify-between hover:bg-pink-50 hover:text-pink-600">
                                            <Link href={`/dashboard/${list.id}`}>
                                                Gerenciar Lista <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
