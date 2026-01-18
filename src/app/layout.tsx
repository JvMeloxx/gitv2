import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gifts2 - Compartilhe sua Lista de Desejos",
  description: "Crie e compartilhe listas de presentes para seus eventos especiais.",
  openGraph: {
    title: "Gifts2 - Presentes que viram experiências",
    description: "Crie sua lista de presentes virtual, receba em dinheiro ou produtos. Simples, bonito e flexível.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
