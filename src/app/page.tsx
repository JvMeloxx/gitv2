import Link from "next/link";
import { Gift, Wallet, LayoutDashboard, QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-accent selection:text-accent-foreground">

            {/* 1. Hero Section - Editorial Style */}
            <main className="w-full max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-border bg-secondary/30 text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        A Nova Era das Listas de Presentes
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium text-foreground tracking-tight leading-[1.1]">
                        Celebre com <span className="italic text-accent-foreground">Liberdade</span>. <br />
                        Receba com <span className="italic text-accent-foreground">Elegância</span>.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                        A plataforma definitiva para casamentos e eventos exclusivos.
                        Crie sua lista virtual, receba presentes em dinheiro (Pix) e gerencie tudo em um dashboard impecável.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/create"
                            className="inline-flex h-14 items-center justify-center rounded-sm bg-primary px-10 text-lg font-medium text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-[1.01]"
                        >
                            Criar Minha Lista
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-14 items-center justify-center rounded-sm border border-input bg-background px-10 text-lg font-medium text-foreground transition-all hover:bg-secondary/40"
                        >
                            Conhecer Recursos
                        </Link>
                    </div>
                </div>
            </main>

            {/* 2. Narrative Section - The Solution */}
            <section className="bg-secondary/30 py-24 border-y border-border/50">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-foreground">
                        Por que limitar seus sonhos a uma loja física?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">O Passado</h3>
                            <p className="text-lg leading-relaxed text-foreground/80">
                                Listas tradicionais prendem você a créditos em lojas específicas,
                                com prazos de troca curtos e produtos que você talvez nem precise.
                                É burocrático e limitado.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold uppercase tracking-wide text-accent-foreground">O Gifts2</h3>
                            <p className="text-lg leading-relaxed text-foreground/80">
                                Receba o valor integral dos presentes via Pix.
                                Use para a lua de mel, para reformar a casa ou investir.
                                A escolha é 100% sua, sem taxas escondidas e com total liberdade.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Steps Section - How it Works */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">Simples. Transparente. Sofisticado.</h2>
                    <p className="text-muted-foreground">Sua jornada em três passos elegantes.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { step: "01", title: "Crie sua Página", desc: "Personalize sua lista com fotos, mensagens e os presentes dos seus sonhos em minutos." },
                        { step: "02", title: "Compartilhe", desc: "Envie o link ou QR Code no convite. Seus convidados presenteiam de forma rápida e segura." },
                        { step: "03", title: "Receba via Pix", desc: "O valor cai na sua conta cadastrada. Sem intermediários, sem complicações." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4">
                            <span className="text-6xl font-serif text-secondary font-bold opacity-50">{item.step}</span>
                            <h3 className="text-xl font-medium">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Features Grid - Detailed Info */}
            <section className="bg-foreground text-background py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Pix Instantâneo", desc: "Acesso imediato aos valores recebidos. O dinheiro é seu, na hora." },
                            { title: "Painel de Controle", desc: "Gerencie presentes, agradecimentos e mensagens em um único lugar." },
                            { title: "RSVP Integrado", desc: "Seus convidados confirmam presença diretamente pela sua página." },
                            { title: "Taxas Justas", desc: "Apenas uma pequena taxa administrativa. Nada de surpresas." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-6 border border-white/10 rounded-sm hover:bg-white/5 transition-colors group">
                                <h3 className="text-lg font-serif mb-2 text-primary-foreground group-hover:text-amber-200 transition-colors">{feature.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FAQ Section - Questions */}
            <section className="py-24 max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-serif text-center mb-12">Dúvidas Frequentes</h2>
                <div className="space-y-6">
                    {[
                        { q: "É seguro receber via Pix?", a: "Sim. Utilizamos gateways de pagamento criptografados e o valor é transferido diretamente para a conta do organizador." },
                        { q: "Posso criar listas para outros eventos?", a: "Absolutamente. O Gifts2 é perfeito para Chás de Bebê, Aniversários, Bodas e Open House." },
                        { q: "Quanto custa?", a: "Criar a lista é 100% gratuito. Existe apenas uma pequena taxa de processamento sobre os presentes recebidos, que pode ser repassada ao convidado." }
                    ].map((faq, idx) => (
                        <div key={idx} className="p-6 bg-secondary/20 rounded-sm border border-border/50">
                            <h3 className="font-medium text-lg mb-2">{faq.q}</h3>
                            <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="py-12 border-t border-border bg-background text-center">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
                    <Gift className="w-8 h-8 text-foreground opacity-20" />
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Gifts2 • Elegância em cada detalhe.</p>
                </div>
            </footer>
        </div>
    );
}
