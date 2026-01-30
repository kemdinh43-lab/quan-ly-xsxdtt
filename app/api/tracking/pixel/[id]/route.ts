import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 });
        }

        // Update opened status
        // Fire and forget or await - using await to ensure consistency
        try {
            await prisma.emailLog.update({
                where: { id },
                data: {
                    opened: true,
                    openedAt: new Date(),
                },
            });
        } catch (err) {
            // Ignore errors (e.g. record not found) to not break image load
            console.error('Failed to track email open:', err);
        }

        // Return a 1x1 transparent GIF or PNG
        // This is a minimal valid 1x1 transparent GIF
        const transparentGif = Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            'base64'
        );

        return new NextResponse(transparentGif, {
            headers: {
                'Content-Type': 'image/gif',
                'Content-Length': transparentGif.length.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

    } catch (error) {
        console.error('Error serving tracking pixel:', error);
        return new NextResponse('Error', { status: 500 });
    }
}
