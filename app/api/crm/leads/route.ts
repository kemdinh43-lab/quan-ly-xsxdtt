import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status ? { status } : {};

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching leads" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, companyName, source, estimatedValue } = body;

        const lead = await prisma.lead.create({
            data: {
                name,
                phone,
                companyName,
                source,
                estimatedValue: parseFloat(estimatedValue || 0),
                status: "NEW"
            }
        });

        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: "Error creating lead" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const lead = await prisma.lead.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: "Error updating lead" }, { status: 500 });
    }
}
