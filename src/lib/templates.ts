import { EventType, GiftTemplate } from "./types";

export const GIFT_TEMPLATES: Record<EventType, GiftTemplate> = {
    wedding: {
        name: "Wedding",
        items: [
            { name: "Jogo de Jantar", category: "Cozinha", quantityNeeded: 1, description: "Aparelho de jantar cerâmica 12 peças", imageUrl: "https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&q=80&w=400" },
            { name: "Faqueiro", category: "Cozinha", quantityNeeded: 1, description: "Faqueiro inox 24 peças", imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=400" },
            { name: "Liquidificador", category: "Eletros", quantityNeeded: 1, description: "Liquidificador alta potência", imageUrl: "https://images.unsplash.com/photo-1570222100680-bccec696530a?auto=format&fit=crop&q=80&w=400" },
            { name: "Cafeteira", category: "Eletros", quantityNeeded: 1, description: "Cafeteira expresso ou filtro", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400" },
            { name: "Torradeira", category: "Eletros", quantityNeeded: 1, description: "Torradeira inox 2 fatias", imageUrl: "https://images.unsplash.com/photo-1584946390141-8e0c609c1187?auto=format&fit=crop&q=80&w=400" },
            { name: "Jogo de Lençol", category: "Quarto", quantityNeeded: 2, description: "Jogo de cama algodão Queen", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
            { name: "Toalhas de Banho", category: "Banheiro", quantityNeeded: 4, description: "Conjunto de toalhas macias", imageUrl: "https://images.unsplash.com/photo-1560607014-4a5726e0332f?auto=format&fit=crop&q=80&w=400" },
            { name: "Microondas", category: "Eletros", quantityNeeded: 1, description: "Microondas inox 30L", imageUrl: "https://images.unsplash.com/photo-1585659711988-dc921001ef06?auto=format&fit=crop&q=80&w=400" },
        ]
    },
    baby_shower: {
        name: "Baby Shower",
        items: [
            { name: "Fraldas (Tam M)", category: "Essenciais", quantityNeeded: 3, description: "Pacote de fraldas de pano ou descartáveis", imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400" },
            { name: "Lenços Umedecidos", category: "Essenciais", quantityNeeded: 5, description: "Lenços infantis sem fragrância", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
            { name: "Carrinho de Bebê", category: "Equipamentos", quantityNeeded: 1, description: "Carrinho dobrável e leve", imageUrl: "https://images.unsplash.com/photo-1591576445781-703356247c6b?auto=format&fit=crop&q=80&w=400" },
            { name: "Berço", category: "Móveis", quantityNeeded: 1, description: "Berço americano padrão", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
            { name: "Boby Infantil", category: "Roupas", quantityNeeded: 5, description: "Bodies de algodão sortidos", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
            { name: "Babá Eletrônica", category: "Segurança", quantityNeeded: 1, description: "Monitor de vídeo", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" },
            { name: "Banheira", category: "Banho", quantityNeeded: 1, description: "Banheira ergonômica", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" },
            { name: "Kit Mamadeiras", category: "Alimentação", quantityNeeded: 1, description: "Kit inicial de mamadeiras", imageUrl: "https://images.unsplash.com/photo-1555133550-b13970fd6fb9?auto=format&fit=crop&q=80&w=400" },
        ]
    },
    housewarming: {
        name: "Housewarming",
        items: [
            { name: "Jogo de Panelas", category: "Cozinha", quantityNeeded: 1, description: "Conjunto antiaderente", imageUrl: "https://images.unsplash.com/photo-1584946714184-2410175156a9?auto=format&fit=crop&q=80&w=400" },
            { name: "Jogo de Facas", category: "Cozinha", quantityNeeded: 1, description: "Bloco de facas do chef", imageUrl: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=400" },
            { name: "Aspirador de Pó", category: "Limpeza", quantityNeeded: 1, description: "Aspirador vertical potente", imageUrl: "https://images.unsplash.com/photo-1520116467521-812bc7059837?auto=format&fit=crop&q=80&w=400" },
            { name: "Tapete de Boas-Vindas", category: "Decoração", quantityNeeded: 1, description: "Tapete para entrada", imageUrl: "https://images.unsplash.com/photo-1624531478546-f94d3ae14902?auto=format&fit=crop&q=80&w=400" },
            { name: "Relógio de Parede", category: "Decoração", quantityNeeded: 1, description: "Relógio minimalista", imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=400" },
            { name: "Vasos de Plantas", category: "Jardim", quantityNeeded: 3, description: "Vasos de cerâmica decorativos", imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=400" },
            { name: "Taças de Vinho", category: "Bar", quantityNeeded: 1, description: "Jogo de 6 taças de cristal", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400" },
            { name: "Maleta de Ferramentas", category: "Ferramentas", quantityNeeded: 1, description: "Kit básico de ferramentas", imageUrl: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400" },
        ]
    },
    birthday: {
        name: "Birthday",
        items: [
            { name: "Cartão Presente", category: "Geral", quantityNeeded: 1, description: "Cartão Amazon, App Store ou outros", imageUrl: "https://images.unsplash.com/photo-1549463511-10510f9dca12?auto=format&fit=crop&q=80&w=400" },
            { name: "Livros", category: "Entretenimento", quantityNeeded: 3, description: "Bestsellers ou favoritos", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=400" },
            { name: "Jogo de Tabuleiro", category: "Entretenimento", quantityNeeded: 1, description: "Estratégia ou diversão em grupo", imageUrl: "https://images.unsplash.com/photo-1610890732551-21346c30bb02?auto=format&fit=crop&q=80&w=400" },
        ]
    },
    other: {
        name: "Custom Event",
        items: []
    }
};
