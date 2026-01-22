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
        <header className="w-full py-4 px-6 bg-white/90 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                    <div className="bg-primary/5 rounded-sm p-1.5 transition-colors group-hover:bg-primary/10">
                        <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl font-serif font-bold tracking-tight text-foreground">
                        Gifts<span className="text-accent-foreground italic">2</span>
                    </span>
                </Link>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                                {user.name.split(" ")[0]}
                            </span>
                            <form action={logoutUser}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <LogOut className="w-4 h-4 mr-2" /> Sair
                                </Button>
                            </form>
                            <Button asChild size="sm" className="rounded-sm px-6 font-semibold shadow-sm">
                                <Link href="/dashboard">Painel</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                            >
                                Entrar
                            </Link>
                            <Button asChild size="sm" className="rounded-sm px-6 font-semibold shadow-sm">
                                <Link href="/register">Cadastrar</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
