
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // In real app, check if user is MANAGER
    // if (session.user.role !== 'MANAGER') return new NextResponse("Forbidden", { status: 403 });

    try {
        const params = await props.params;
        const body = await request.json();
        const { action, notes } = body; // action: 'APPROVE' | 'REJECT'

        const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        const quote = await prisma.quote.update({
            where: { id: params.id },
            data: {
                status,
                approvalNotes: notes,
                approverId: session.user.id // assuming session user has id
            }
        });

        return NextResponse.json(quote);
    } catch (error) {
        console.error("APPROVE_QUOTE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
