import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                supplier: true,
                items: true,
                requests: true,
                receipts: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pos);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { supplierId, requestIds, note } = body;

        // 1. Get Requests
        const requests = await prisma.purchaseRequest.findMany({
            where: { id: { in: requestIds } }
        });

        if (requests.length === 0) return new NextResponse("No requests selected", { status: 400 });

        // 2. Generate PO Code
        const count = await prisma.purchaseOrder.count();
        const code = `PO-2024-${(count + 1).toString().padStart(3, '0')}`;

        // 3. Create PO Items from Requests
        // Group by Material Name/Unit?? For now, 1 Request = 1 Item
        const itemsData = requests.map(req => ({
            materialName: req.materialName,
            quantity: req.quantity,
            unit: req.unit,
            unitPrice: 0 // To be filled later
        }));

        // 4. Create PO Transaction
        const po = await prisma.$transaction(async (tx) => {
            const newPO = await tx.purchaseOrder.create({
                data: {
                    code,
                    supplierId,
                    note,
                    status: 'DRAFT',
                    items: {
                        create: itemsData
                    }
                }
            });

            // Link Requests to this PO
            await tx.purchaseRequest.updateMany({
                where: { id: { in: requestIds } },
                data: { purchaseOrderId: newPO.id, status: 'ORDERED' }
            });

            return newPO;
        });

        return NextResponse.json(po);

    } catch (error) {
        console.error("CREATE_PO_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
