"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteGiftList } from "@/app/actions";

interface DeleteListButtonProps {
    listId: string;
}

export function DeleteListButton({ listId }: DeleteListButtonProps) {
    const handleDelete = async (e: React.FormEvent) => {
        if (!confirm("Tem certeza que deseja excluir esta lista? Todos os presentes nela também serão removidos.")) {
            e.preventDefault();
            return;
        }
    };

    return (
        <form action={deleteGiftList.bind(null, listId)} onSubmit={handleDelete}>
            <Button type="submit" variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
            </Button>
        </form>
    );
}
