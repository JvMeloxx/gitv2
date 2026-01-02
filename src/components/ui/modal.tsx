import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>
                        {description && (
                            <p className="mt-1.5 text-sm text-gray-500">{description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
