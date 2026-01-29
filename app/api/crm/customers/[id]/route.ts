
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const params = await props.params;
        const customer = await prisma.customer.findUnique({
            where: { id: params.id }
        });
        return NextResponse.json(customer);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
