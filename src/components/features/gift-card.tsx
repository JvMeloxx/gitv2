import { Gift } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GiftCardProps {
    gift: Gift;
    isOrganizer?: boolean;
    onEdit?: (gift: Gift) => void;
    onDelete?: (giftId: string) => void;
    onSelect?: (gift: Gift) => void;
}

export function GiftCard({ gift, isOrganizer = false, onEdit, onDelete, onSelect }: GiftCardProps) {
    const isFullySelected = gift.quantitySelected >= gift.quantityNeeded;

    return (
        <Card className={cn("flex flex-col h-full transition-all duration-200 hover:shadow-lg",
            isFullySelected && !isOrganizer ? "opacity-75 bg-gray-50" : "bg-white"
        )}>
            <div className="relative h-48 w-full bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                {/* Placeholder for real image or fallback icon */}
                {gift.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                )}

                {isFullySelected && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-green-100/90 text-green-700 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Conquistado
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg leading-tight">{gift.name}</CardTitle>
                    {gift.priceEstimate && (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            ~R${gift.priceEstimate}
                        </span>
                    )}
                </div>
                <CardDescription className="text-sm line-clamp-2">{gift.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow text-sm text-gray-600">
                <div className="flex items-center justify-between mt-2">
                    <span className="font-medium">Meta: {gift.quantityNeeded}</span>
                    <span className={cn(
                        "font-medium",
                        gift.quantitySelected > 0 ? "text-primary" : "text-gray-400"
                    )}>
                        Recebidos: {gift.quantitySelected}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="pt-2 gap-2">
                {isOrganizer ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 border-gray-200"
                            onClick={() => onEdit?.(gift)}
                        >
                            <Edit2 className="w-4 h-4" /> Editar
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => onDelete?.(gift.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isFullySelected}
                        onClick={() => onSelect?.(gift)}
                    >
                        {isFullySelected ? "Já Escolhido" : "Escolher Presente"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
