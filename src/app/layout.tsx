import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for clean look
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gifts2 - Compartilhe sua Lista de Desejos",
  description: "Crie e compartilhe listas de presentes para seus eventos especiais.",
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
        </div>
      </body>
    </html>
  );
}
