
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { logs: true },
                },
            },
        });
        return NextResponse.json(campaigns);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, subject, content, targetAudience } = body;

        const campaign = await prisma.campaign.create({
            data: {
                name,
                subject,
                content,
                targetAudience: targetAudience || 'ALL',
                status: 'DRAFT',
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
