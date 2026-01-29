import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { stageId, quantityProduced, quantityError, status } = body;

        if (!stageId) return new NextResponse("Missing stageId", { status: 400 });

        const stage = await prisma.productionStage.update({
            where: { id: stageId },
            data: {
                quantityProduced: quantityProduced !== undefined ? parseInt(quantityProduced) : undefined,
                quantityError: quantityError !== undefined ? parseInt(quantityError) : undefined,
                status: status || undefined,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(stage);
    } catch (error) {
        console.error("PRODUCTION_STAGE_PUT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
