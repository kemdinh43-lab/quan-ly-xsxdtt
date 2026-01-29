
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // Not used but required for type safety
    try {
        const { items } = await req.json();

        // Transactional update for safety
        await prisma.$transaction(
            items.map((item: any) =>
                prisma.product.update({
                    where: { id: item.id },
                    data: {
                        note: item.note
                    }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("UPDATE_ITEMS_ERROR", error);
        return NextResponse.json({ error: "Failed to update items" }, { status: 500 });
    }
}
