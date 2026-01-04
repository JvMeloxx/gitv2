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
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, coverImageUrl: base64String }));
        };
        reader.readAsDataURL(file);
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
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 text-sm text-gray-500">
                                    <p className="font-medium text-gray-700">Subir foto do Celular ou PC</p>
                                    <p>Clique no ícone da câmera para escolher uma foto especial.</p>
                                </div>
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
