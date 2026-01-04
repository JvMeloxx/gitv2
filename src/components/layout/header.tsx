import Link from "next/link";
import { Gift, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutUser } from "@/app/actions";

export async function Header() {
    const session = await getSession();
    let user = null;

    if (session?.userId) {
        try {
            user = await prisma.user.findUnique({
                where: { id: session.userId }
            });
        } catch (error) {
            console.error("Header: Failed to fetch user", error);
        }
    }

    return (
        <header className="w-full py-4 px-6 bg-white/80 backdrop-blur-md border-b border-pink-100/50 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="bg-gradient-to-tr from-pink-400 to-pink-600 rounded-lg p-1.5 shadow-md">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                        Gifts<span className="text-pink-500">2</span>
                    </span>
                </Link>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">
                                {user.name.split(" ")[0]}
                            </span>
                            <form action={logoutUser}>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                                    <LogOut className="w-4 h-4 mr-2" /> Sair
                                </Button>
                            </form>
                            <Button asChild size="sm" className="rounded-full px-6 shadow-md shadow-pink-200">
                                <Link href="/dashboard">Painel</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors hidden sm:block"
                            >
                                Entrar
                            </Link>
                            <Button asChild size="sm" className="rounded-full px-6 shadow-md shadow-pink-200">
                                <Link href="/register">Cadastrar</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
