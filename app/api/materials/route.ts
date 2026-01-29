import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    try {
        const materials = await prisma.material.findMany({
            where: type ? { type } : undefined,
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(materials);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, code, type, color, width, gsm, supplier, unit, minStock } = body;

        // Basic validation
        if (!name || !code) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const material = await prisma.material.create({
            data: {
                name,
                code,
                type,
                color,
                width: width ? parseFloat(width) : null,
                gsm: gsm ? parseFloat(gsm) : null,
                supplier,
                unit,
                minStock: minStock ? parseFloat(minStock) : 0,
                // Initial quantity is 0, must use Import Log to add stock
                quantity: 0
            },
        });

        return NextResponse.json(material);
    } catch (error) {
        console.error("MATERIAL_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
