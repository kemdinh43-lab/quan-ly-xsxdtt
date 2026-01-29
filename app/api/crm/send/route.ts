import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { to, subject, message } = body;

        if (!to || !subject || !message) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Load credentials
        const EMAIL_USER = process.env.EMAIL_USER;
        const EMAIL_PASS = process.env.EMAIL_PASS;

        let transporter;

        if (EMAIL_USER && EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: EMAIL_USER, pass: EMAIL_PASS }
            });
        } else {
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: { user: 'ethereal.user@ethereal.email', pass: 'ethereal.pass' }
            });
        }

        const prisma = new PrismaClient();

        // Always attempt to send if configured, or if mock
        try {
            await transporter.sendMail({
                from: `"Marketing Team" <${EMAIL_USER || 'marketing@duongthanhtin.com'}>`,
                to,
                subject,
                text: message,
                html: `<p>${message.replace(/\n/g, '<br>')}</p>`
            });

            // Log success to DB
            await prisma.emailLog.create({
                data: {
                    recipient: to,
                    subject: subject,
                    status: 'SENT',
                    sentAt: new Date()
                }
            });
        } catch (sendError) {
            console.error("Nodemailer Error", sendError);
            // Log failure to DB
            await prisma.emailLog.create({
                data: {
                    recipient: to,
                    subject: subject,
                    status: 'FAILED',
                    sentAt: new Date()
                }
            });
            throw sendError; // Re-throw to be caught by outer catch
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("CRM_SEND_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
