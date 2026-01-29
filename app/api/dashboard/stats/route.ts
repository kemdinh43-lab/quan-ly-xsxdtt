import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // 1. Inventory Stats
        const materials = await prisma.material.findMany();
        const totalMaterialCount = materials.length;
        const lowStockCount = materials.filter(m => m.quantity <= m.minStock).length;

        // 2. Orders Stats
        const orders = await prisma.order.findMany();
        const activeOrdersCount = orders.filter(o => ['CONFIRMED', 'PRODUCING'].includes(o.status)).length;
        const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

        // Calculate Revenue (Total Amount of Completed/Delivered Orders)
        const revenue = orders
            .filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status))
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Count Pending PRs
        const pendingPR = await prisma.purchaseRequest.count({
            where: { status: 'PENDING' }
        });

        // 3. Production Stats (Aggregate progress across active plans)
        const activePlans = await prisma.productionPlan.findMany({
            where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } },
            include: { stages: true }
        });

        // Calculate overall progress per stage for visualization
        // E.g., Total Cut vs Total Target across all active orders
        const productionStats = [
            { name: 'Cutting', completed: 0, target: 0 },
            { name: 'Sewing', completed: 0, target: 0 },
            { name: 'QC', completed: 0, target: 0 },
            { name: 'Packing', completed: 0, target: 0 },
        ];

        activePlans.forEach(plan => {
            const cut = plan.stages.find(s => s.name.includes('CUTTING'));
            const sew = plan.stages.find(s => s.name.includes('SEWING'));
            const qc = plan.stages.find(s => s.name.includes('QC'));
            const pack = plan.stages.find(s => s.name.includes('PACKING'));

            if (cut) { productionStats[0].completed += cut.quantityProduced; productionStats[0].target += cut.quantityTarget; }
            if (sew) { productionStats[1].completed += sew.quantityProduced; productionStats[1].target += sew.quantityTarget; }
            if (qc) { productionStats[2].completed += qc.quantityProduced; productionStats[2].target += qc.quantityTarget; }
            if (pack) { productionStats[3].completed += pack.quantityProduced; productionStats[3].target += pack.quantityTarget; }
        });

        // 4. Recent Activities
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: { code: true, status: true, updatedAt: true, customerName: true }
        });

        const recentMaterials = await prisma.material.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: { code: true, name: true, quantity: true, updatedAt: true }
        });

        // 5. Line Chart Data: Orders Trend last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ordersLast7Days = await prisma.order.findMany({
            where: { createdAt: { gte: sevenDaysAgo } }
        });

        const trendMap = new Map();
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            trendMap.set(dateStr, 0);
        }

        ordersLast7Days.forEach(o => {
            const dateStr = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (trendMap.has(dateStr)) {
                trendMap.set(dateStr, trendMap.get(dateStr) + 1);
            }
        });

        const orderTrend = Array.from(trendMap).map(([date, count]) => ({ date, count }));

        // 6. Pie Chart Data: Material Distribution by Type
        const materialByType = await prisma.material.groupBy({
            by: ['type'],
            _count: { id: true }
        });

        const materialDistribution = materialByType.map(m => ({
            name: m.type,
            value: m._count.id
        }));

        // Merge and sort
        const activities = [
            ...recentOrders.map(o => ({
                id: o.code,
                type: 'ORDER',
                message: `Đơn hàng ${o.code} cập nhật trạng thái: ${o.status}`,
                time: o.updatedAt
            })),
            ...recentMaterials.map(m => ({
                id: m.code,
                type: 'MATERIAL',
                message: `Vật tư ${m.name} cập nhật tồn kho: ${m.quantity}`,
                time: m.updatedAt
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

        return NextResponse.json({
            kpi: {
                totalMaterials: totalMaterialCount,
                lowStock: lowStockCount,
                activeOrders: activeOrdersCount,
                completedOrders: completedOrdersCount,
                revenue,
                pendingPR
            },
            productionChart: productionStats,
            orderTrend,
            materialDistribution,
            activities
        });

    } catch (error) {
        console.error("DASHBOARD_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
