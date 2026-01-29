import { PrismaClient } from '@prisma/client';
// Use global fetch


const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log("🚀 Starting Procurement Flow Test...");

    // 1. Setup Data: Create a Dummy Supplier and Order
    const supplier = await prisma.supplier.create({
        data: { name: 'Test Supplier ' + Date.now(), phone: '0999888777' }
    });

    const order = await prisma.order.create({
        data: {
            code: 'TEST-ORD-' + Date.now(),
            customerName: 'Test Customer',
            status: 'CONFIRMED'
        }
    });

    console.log(`✅ Created Supplier: ${supplier.name} (${supplier.id})`);
    console.log(`✅ Created Order: ${order.code} (${order.id})`);

    // 2. Create a Purchase Request (simulate system generation)
    const request = await prisma.purchaseRequest.create({
        data: {
            orderId: order.id,
            materialName: 'Vải Cotton Test Flow',
            quantity: 100,
            unit: 'METER',
            status: 'PENDING'
        }
    });
    console.log(`✅ Created Purchase Request: ${request.id}`);

    // 3. Test API: Create Purchase Order (PO)
    console.log("👉 Testing POST /api/procurement/orders...");
    const poRes = await fetch(`${BASE_URL}/api/procurement/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            supplierId: supplier.id,
            requestIds: [request.id],
            note: 'Test PO via Script'
        })
    });

    if (poRes.status !== 200) {
        throw new Error(`Failed to create PO: ${await poRes.text()}`);
    }

    const po = await poRes.json();
    console.log(`✅ API Created PO: ${po.code} (${po.id})`);
    console.log(`   - Items: ${po.items.length}`);

    // 4. Test API: Warehouse Receipt (Import)
    console.log("👉 Testing POST /api/warehouse/receipts...");
    const receiptRes = await fetch(`${BASE_URL}/api/warehouse/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            purchaseOrderId: po.id,
            note: 'Test Receipt via Script',
            items: [
                {
                    materialName: 'Vải Cotton Test Flow', // Should match PO item logic or new
                    quantity: 100,
                    unit: 'METER',
                    lotNumber: 'LOT-TEST-123'
                }
            ]
        })
    });

    if (receiptRes.status !== 200) {
        throw new Error(`Failed to create Receipt: ${await receiptRes.text()}`);
    }

    const receipt = await receiptRes.json();
    console.log(`✅ API Created Receipt: ${receipt.code}`);

    // 5. Verify Material Stock
    const material = await prisma.material.findUnique({
        where: { code: receipt.items?.[0]?.material?.code } // Wait, receipt returns items with material relations?
    }) || await prisma.material.findFirst({ where: { name: 'Vải Cotton Test Flow' } });

    if (material) {
        console.log(`✅ Verified Material Stock: ${material.name} = ${material.quantity} ${material.unit}`);
        if (material.quantity !== 100) console.warn("⚠️ Warning: Quantity mismatch!");
    } else {
        console.error("❌ Material not found after receipt!");
    }

    // Cleanup (optional, keeping for inspect)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
