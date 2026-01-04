"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createGiftList } from "@/app/actions";
import { EventType } from "@/lib/types";
import { Camera, Image as ImageIcon } from "lucide-react";

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
    });

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_SIZE = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
            };
        });
    };

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

                        {/* Background Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">
                                Imagem de Fundo (Opcional)
                            </label>
                            <div className="relative w-full h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-pink-300 transition-colors group">
                                {formData.backgroundImageUrl ? (
                                    <>
                                        <img src={formData.backgroundImageUrl} alt="Background Preview" className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Alterar Fundo</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-xs font-medium">Subir foto de fundo (Fixo)</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleImageChange(e, "backgroundImageUrl")}
                                />
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
