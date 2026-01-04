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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col items-center justify-center p-4">
            <main className="text-center space-y-8 max-w-4xl mx-auto py-12">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <Gift className="w-12 h-12 text-pink-500" />
                    </div>
                </div>

                {/* Categories Section */}
                <div className="flex flex-wrap justify-center gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {[
                        { name: "Casamento", img: "/categories/wedding.png" },
                        { name: "Aniversário", img: "/categories/birthday.png" },
                        { name: "Chá de Bebê", img: "/categories/babyshower.png" },
                        { name: "Chá de Casa", img: "/categories/housewarming.png" },
                        { name: "Outros", img: "/categories/other.png" },
                    ].map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:shadow-pink-200 group-hover:border-pink-200 transition-all duration-300">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors uppercase tracking-wider">{cat.name}</span>
                        </div>
                    ))}
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
