import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
    // List receipts
    try {
        const receipts = await prisma.materialReceipt.findMany({
            include: { purchaseOrder: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(receipts);
    } catch (e) {
        return new NextResponse("Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { purchaseOrderId, items, note } = body;
        // items: [{ materialName, materialId (optional), quantity, unit, lotNumber }]

        // 1. Generate Receipt Code
        const count = await prisma.materialReceipt.count();
        const code = `PNK-2024-${(count + 1).toString().padStart(3, '0')}`;

        // 2. Transaction
        const receipt = await prisma.$transaction(async (tx) => {
            // A. Create Receipt
            const newReceipt = await tx.materialReceipt.create({
                data: {
                    code,
                    purchaseOrderId,
                    note,
                    performer: 'Kho', // Should get from Auth
                    items: {
                        create: await Promise.all(items.map(async (item: any) => {
                            // Find or Create Material
                            // If materialId is provided, use it. If not, try to find by name or create generic.
                            let matId = item.materialId;

                            if (!matId) {
                                // Try find by name
                                const existingMat = await tx.material.findFirst({ where: { name: item.materialName } });
                                if (existingMat) {
                                    matId = existingMat.id;
                                    // Update stock
                                    await tx.material.update({
                                        where: { id: matId },
                                        data: { quantity: { increment: Number(item.quantity) } }
                                    });
                                } else {
                                    // Create new Material
                                    const newMat = await tx.material.create({
                                        data: {
                                            name: item.materialName,
                                            code: `MAT-${Date.now().toString().slice(-4)}`, // Temp code
                                            type: 'FABRIC', // Default
                                            unit: item.unit,
                                            quantity: Number(item.quantity)
                                        }
                                    });
                                    matId = newMat.id;
                                }
                            } else {
                                // Update existing stock
                                await tx.material.update({
                                    where: { id: matId },
                                    data: { quantity: { increment: Number(item.quantity) } }
                                });
                            }

                            // Log Inventory
                            await tx.inventoryLog.create({
                                data: {
                                    materialId: matId,
                                    type: 'IMPORT',
                                    quantity: Number(item.quantity),
                                    reason: `Nhập kho từ PO ${purchaseOrderId || 'Direct'}`
                                }
                            });

                            return {
                                materialId: matId,
                                quantity: Number(item.quantity),
                                unit: item.unit,
                                lotNumber: item.lotNumber
                            };
                        }))
                    }
                }
            });

            // B. Update PO Status if all items received (Simplified: Mark PO as COMPLETED if it has a receipt)
            if (purchaseOrderId) {
                await tx.purchaseOrder.update({
                    where: { id: purchaseOrderId },
                    data: { status: 'COMPLETED' } // Or PARTIAL logic if complex
                });
            }

            return newReceipt;
        });

        return NextResponse.json(receipt);

    } catch (error) {
        console.error("RECEIPT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
