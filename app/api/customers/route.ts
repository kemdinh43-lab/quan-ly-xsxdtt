
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";

    try {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } }, // Case insensitive usually depends on DB collation
                { phone: { contains: search } },
                { companyName: { contains: search } }
            ];
        }

        if (type !== "ALL") where.type = type;
        if (status !== "ALL") where.status = status;

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { lastInteraction: 'desc' },
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            take: 50
        });

        // Calculate simple metrics (mock or real)
        const totalLeads = await prisma.customer.count({ where: { status: 'LEAD' } });
        const activeCustomers = await prisma.customer.count({ where: { status: 'CUSTOMER' } });
        const revenueAgg = await prisma.customer.aggregate({ _sum: { totalRevenue: true } });

        return NextResponse.json({
            customers,
            metrics: {
                totalLeads,
                activeCustomers,
                totalRevenue: revenueAgg._sum.totalRevenue || 0
            }
        });

    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { name, phone, companyName, type, source, email, address } = body;

        // check exists
        const exists = await prisma.customer.findUnique({ where: { phone } });
        if (exists) return new NextResponse("Phone exists", { status: 409 });

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                companyName,
                type,
                source,
                email,
                address,
                status: 'LEAD', // Default
                lastInteraction: new Date()
            }
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("CREATE_CUSTOMER_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
