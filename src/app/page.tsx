import Link from "next/link";
import { Gift } from "lucide-react";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await getSession();
    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col items-center justify-center p-4">
            <main className="text-center space-y-8 max-w-2xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <Gift className="w-12 h-12 text-pink-500" />
                    </div>
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-4">
                    Gifts<span className="text-pink-500">2</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Uma plataforma simples e bonita para criar listas de presentes para seus eventos especiais.
                    Compartilhe com amigos e receba o que você realmente precisa.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/create"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-pink-500 rounded-full hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Criar Lista
                    </Link>
                    <Link
                        href="/about"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors hover:border-gray-300 shadow-sm"
                    >
                        Saiba Mais
                    </Link>
                </div>
            </main>

            <footer className="mt-16 text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Gifts2. Simplifique sua celebração.</p>
            </footer>
        </div>
    );
}
