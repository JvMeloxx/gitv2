import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { GuestListClient } from "./client";

export const dynamic = 'force-dynamic';

export default async function GuestList({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const queryOptions: any = {
        select: {
            id: true,
            slug: true,
            title: true,
            organizerName: true,
            eventDate: true,
            location: true,
            coverImageUrl: true,
            theme: true,
            backgroundImageUrl: true,
            isCashEnabled: true,
            gifts: {
                include: {
                    selections: true
                }
            }
        }
    };

    const list = await prisma.giftList.findUnique({
        where: { slug: id },
        ...queryOptions
    }) || await prisma.giftList.findUnique({
        where: { id },
        ...queryOptions
    });

    if (!list) {
        notFound();
    }

    return <GuestListClient list={list as any} />;
}
