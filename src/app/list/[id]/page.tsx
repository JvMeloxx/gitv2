import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { GuestListClient } from "./client";

export const dynamic = 'force-dynamic';

export default async function GuestList({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const list = await prisma.giftList.findUnique({
        where: { slug: id },
        include: {
            gifts: {
                include: {
                    selections: true
                }
            }
        }
    }) || await prisma.giftList.findUnique({
        where: { id },
        include: {
            gifts: {
                include: {
                    selections: true
                }
            }
        }
    });

    if (!list) {
        notFound();
    }

    return <GuestListClient list={list} />;
}
