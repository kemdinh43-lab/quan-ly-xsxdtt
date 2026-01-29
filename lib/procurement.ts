
import { prisma } from "./prisma";

// Default Consumption Rate (Định mức mặc định)
// 1 Product = 1.2 meters of main fabric
const DEFAULT_FABRIC_RATIO = 1.2;

export async function generatePurchaseRequestsForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) throw new Error("Order not found");

    const requests = [];

    // Group items by "Name + Color" to aggregate material needs
    // This is a simplification. Ideally, we parse the "Material" field from Tech Specs.
    // For now, we assume "Product Name" contains the key fabric info or we just consolidate by color.

    // Let's iterate and just create raw requests first, we can group later or here.
    // Grouping by unique Key (Name + Color)
    const aggregatedNeeds: Record<string, number> = {};

    for (const item of order.items) {
        // Key: "Vải chính (màu [Color])"
        const materialName = `Vải chính cho ${item.name} (${item.color || 'Màu gốc'})`;

        // Use Manual Norm from Quote if available, else Default
        // @ts-ignore
        const ratio = item.consumption || DEFAULT_FABRIC_RATIO;
        const fabricNeeded = item.quantity * ratio;

        if (!aggregatedNeeds[materialName]) {
            aggregatedNeeds[materialName] = 0;
        }
        aggregatedNeeds[materialName] += fabricNeeded;
    }

    // Create DB Records
    for (const [materialName, quantity] of Object.entries(aggregatedNeeds)) {
        const pr = await prisma.purchaseRequest.create({
            data: {
                orderId: order.id,
                materialName: materialName,
                quantity: quantity,
                unit: 'METER',
                status: 'PENDING'
            }
        });
        requests.push(pr);
    }

    return requests;
}
