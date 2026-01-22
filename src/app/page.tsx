import Link from "next/link";
import { Gift } from "lucide-react";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    let session = null;
    try {
        session = await getSession();
    } catch (error) {
        console.error("Home: Failed to get session", error);
    }

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Column: Typography Strategy */}
                <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium border border-border/50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Nova Versão 3.0
                        </div>
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">
                            Gifts
                            <span className="text-primary block">Inteligentes.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                            A plataforma de listas de presentes para quem valoriza design, simplicidade e liberdade. Receba em produtos ou Pix.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/create"
                            className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02]"
                        >
                            Criar Lista Grátis
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-14 items-center justify-center rounded-lg border-2 border-border bg-background px-8 text-lg font-medium text-foreground transition-all hover:bg-secondary/50 hover:border-primary/20"
                        >
                            Ver Demo
                        </Link>
                    </div>

                    {/* Trust/Tech Badges */}
                    <div className="pt-8 border-t border-border flex gap-8 text-muted-foreground grayscale opacity-70">
                        {/* Placeholder for simple tech-looking badges or text */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-mono">Pix Instantâneo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-mono">Dashboard Real-time</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Abstract Tech Visual */}
                <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 hidden lg:block">
                    {/* Decorative Abstract Shapes */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>

                    {/* "Dashboard" Preview Card */}
                    <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400 rounded-t-2xl"></div>

                        {/* Mock UI Elements */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-6 border-b border-border">
                                <div className="space-y-1">
                                    <div className="h-4 w-32 bg-secondary rounded animate-pulse"></div>
                                    <div className="h-8 w-48 bg-primary/10 rounded"></div>
                                </div>
                                <div className="h-10 w-10 bg-secondary rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-2">
                                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                        <Gift className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-2xl font-bold">R$ 4.250</div>
                                    <div className="text-xs text-muted-foreground">Arrecadado</div>
                                </div>
                                <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-2">
                                    <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="text-2xl font-bold">128</div>
                                    <div className="text-xs text-muted-foreground">Presentes</div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                                        <div className="w-10 h-10 rounded bg-secondary"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-3/4 bg-secondary rounded"></div>
                                            <div className="h-2 w-1/2 bg-secondary/50 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Tech Features Grid - Replaces old "Categories" */}
            <section className="bg-secondary/20 py-24 border-t border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Dashboard", desc: "Controle total dos seus presentes e convidados em tempo real.", icon: "bar-chart-2" },
                            { title: "Pix Direto", desc: "Receba o valor dos presentes diretamente na sua conta, sem taxas escondidas.", icon: "zap" },
                            { title: "Multi-Eventos", desc: "Gerencie Casamentos, Aniversários e Chás em um único lugar.", icon: "layers" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
                                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="mt-auto py-12 border-t border-border bg-background">
                <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
                    <p>© {new Date().getFullYear()} Gifts2 Platform. Engineered for Celebration.</p>
                </div>
            </footer>
        </div>
    );
}
