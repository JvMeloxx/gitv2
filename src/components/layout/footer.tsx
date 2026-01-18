import Link from "next/link";
import { Gift } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-pink-50 p-2 rounded-full">
                            <Gift className="w-5 h-5 text-pink-500" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Gifts<span className="text-pink-500">2</span></span>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-pink-600 transition-colors">Termos de Uso</Link>
                        <Link href="/privacy" className="hover:text-pink-600 transition-colors">Privacidade</Link>
                        <Link href="/help" className="hover:text-pink-600 transition-colors">Ajuda</Link>
                    </div>

                    <div className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Gifts2 Inc.
                    </div>
                </div>
            </div>
        </footer>
    );
}
