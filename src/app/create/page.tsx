"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createGiftList } from "@/app/actions";
import { EventType } from "@/lib/types";
import { Camera, Image as ImageIcon } from "lucide-react";
import { resizeImage } from "@/lib/images";

export default function CreateList() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        eventType: "wedding" as EventType,
        organizerName: "",
        title: "",
        eventDate: "",
        location: "",
        coverImageUrl: "",
        theme: "default",
        backgroundImageUrl: "",
        organizerPhone: "",
        organizerEmail: "",
    });


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImageUrl" | "backgroundImageUrl") => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const compressedBase64 = await resizeImage(file);
            setFormData(prev => ({ ...prev, [field]: compressedBase64 }));
        } catch (err) {
            console.error("Error resizing image:", err);
            setError("Erro ao processar imagem. Tente outra foto.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createGiftList({
                eventType: formData.eventType,
                organizerName: formData.organizerName,
                title: formData.title || `${formData.eventType === 'wedding' ? 'Casamento de' : formData.eventType === 'birthday' ? 'Aniversário de' : 'Evento de'} ${formData.organizerName}`,
                eventDate: formData.eventDate,
                location: formData.location,
                coverImageUrl: formData.coverImageUrl,
                theme: formData.theme,
                backgroundImageUrl: formData.backgroundImageUrl,
            });
        } catch (error) {
            if (error instanceof Error && error.message === "NEXT_REDIRECT") {
                throw error;
            }
            console.error(error);
            setError("Erro ao criar lista. Verifique a conexão com o banco de dados.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl bg-white/90 backdrop-blur">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">Crie sua Lista</CardTitle>
                    <CardDescription>Conte-nos um pouco sobre seu evento especial</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="eventType" className="text-sm font-medium text-gray-700 block">
                                Tipo de Evento
                            </label>
                            <Select
                                id="eventType"
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                                required
                            >
                                <option value="wedding">Casamento</option>
                                <option value="baby_shower">Chá de Bebê</option>
                                <option value="housewarming">Chá de Casa Nova</option>
                                <option value="birthday">Aniversário</option>
                                <option value="other">Outro</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="organizerName" className="text-sm font-medium text-gray-700 block">
                                Seu Nome / Organizador
                            </label>
                            <Input
                                id="organizerName"
                                placeholder="ex: Maria Silva"
                                value={formData.organizerName}
                                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 block">
                                Título do Evento (Opcional)
                            </label>
                            <Input
                                id="title"
                                placeholder="ex: Casamento da Maria & João"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="eventDate" className="text-sm font-medium text-gray-700 block">
                                Data
                            </label>
                            <Input
                                id="eventDate"
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium text-gray-700 block">
                                Local (Opcional)
                            </label>
                            <Input
                                id="location"
                                placeholder="ex: Rio de Janeiro"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="organizerPhone" className="text-sm font-medium text-gray-700 block">
                                    Seu Celular (Opcional)
                                </label>
                                <Input
                                    id="organizerPhone"
                                    type="tel"
                                    placeholder="ex: 11999999999"
                                    value={formData.organizerPhone}
                                    onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="organizerEmail" className="text-sm font-medium text-gray-700 block">
                                    Seu E-mail (Opcional)
                                </label>
                                <Input
                                    id="organizerEmail"
                                    type="email"
                                    placeholder="ex: voce@exemplo.com"
                                    value={formData.organizerEmail}
                                    onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">Para receber avisos quando alguém escolher um presente.</p>

                        <div className="space-y-4 pt-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Foto de Perfil da Lista (Opcional)
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center transition-all group-hover:border-pink-300">
                                        {formData.coverImageUrl ? (
                                            <img src={formData.coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="imageUpload"
                                        className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full text-white shadow-lg cursor-pointer hover:bg-pink-600 transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <input
                                            id="imageUpload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(e, "coverImageUrl")}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 text-sm text-gray-500">
                                    <p className="font-medium text-gray-700">Foto Redonda de Perfil</p>
                                    <p>Clique no ícone da câmera para escolher uma foto especial.</p>
                                </div>
                            </div>
                        </div>

                        {/* Theme Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">
                                Escolha um Tema Visual
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "default", label: "Padrão", color: "bg-rose-500" },
                                    { id: "romantic", label: "Romântico", color: "bg-fuchsia-700" },
                                    { id: "modern", label: "Moderno", color: "bg-slate-900" },
                                    { id: "baby", label: "Bebê", color: "bg-sky-400" },
                                    { id: "party", label: "Festa", color: "bg-violet-600" },
                                    { id: "nature", label: "Natureza", color: "bg-green-600" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, theme: t.id })}
                                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${formData.theme === t.id ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-pink-200"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${t.color}`} />
                                        <span className="text-[10px] font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Pattern Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">
                                Estampa de Fundo (Opcional)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: "none", label: "Nenhum", preview: "bg-gray-100" },
                                    { id: "floral", label: "Florido", preview: "bg-rose-50" },
                                    { id: "pastel", label: "Pastel", preview: "bg-blue-50" },
                                    { id: "stripes", label: "Listras", preview: "bg-gray-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_2px,#000_1px)] opacity-20" },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, backgroundImageUrl: p.id })}
                                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${formData.backgroundImageUrl === p.id ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-pink-200"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-md ${p.preview} border border-gray-200`} />
                                        <span className="text-[10px] font-medium">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded border border-red-100 mb-4">{error}</p>}
                        <Button
                            type="submit"
                            className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Lista de Presentes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
