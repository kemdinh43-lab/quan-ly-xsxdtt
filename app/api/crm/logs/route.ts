import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const prisma = new PrismaClient();

    try {
        // Fetch logs from DB
        const logs = await prisma.emailLog.findMany({
            orderBy: { sentAt: 'desc' },
            take: 100 // Limit to last 100 emails
        });

        if (logs.length === 0) {
            return NextResponse.json({ logs: "Chưa có lịch sử gửi email." });
        }

        // Format logs to look like the old text file for now (to preserve UI)
        const formattedLogs = logs.map(log => `
[${new Date(log.sentAt).toLocaleString('vi-VN')}] [${log.status}]
---------------------------------------------------
TO: ${log.recipient}
SUBJECT: ${log.subject}
STATUS: ${log.status}
---------------------------------------------------
`).join('\n');

        return NextResponse.json({ logs: formattedLogs });

    } catch (error) {
        console.error("CRM_LOGS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const logPath = path.join(process.cwd(), 'public', 'email_logs.txt');
        if (fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, ''); // Clear content
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
