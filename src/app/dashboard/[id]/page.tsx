import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { DashboardClient } from "./client";

export const dynamic = 'force-dynamic';

export default async function Dashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const list = await prisma.giftList.findUnique({
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

    return <DashboardClient id={id} list={list} />;
}
