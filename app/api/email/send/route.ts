import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma'; // Use singleton

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const to = formData.get('to') as string;
        const subject = formData.get('subject') as string;
        const htmlBody = formData.get('htmlBody') as string;
        const file = formData.get('file') as File | null;

        if (!to || !subject || !htmlBody) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Configure Transporter (MATCHING EXISTING CRM LOGIC)
        const EMAIL_USER = process.env.EMAIL_USER;
        const EMAIL_PASS = process.env.EMAIL_PASS;

        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error('Server limit: Missing EMAIL_USER/PASS in .env');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        // 2. Prepare Mail Options
        const mailOptions: any = {
            from: `"Dương Thành Tín Quote" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlBody,
        };

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            mailOptions.attachments = [
                {
                    filename: file.name,
                    content: buffer,
                    contentType: file.type || 'application/pdf',
                },
            ];
        }

        // 3. Send Email
        await transporter.sendMail(mailOptions);

        // 4. Log to Database (MATCHING CRM LOGIC)
        try {
            await prisma.emailLog.create({
                data: {
                    recipient: to,
                    subject: subject,
                    status: 'SENT',
                    sentAt: new Date(),
                    // Note: We don't store the PDF blob in DB to save space, but we log the event.
                }
            });
            console.log(`[Quote] Email sent & logged for ${to}`);
        } catch (dbError) {
            console.error("Failed to log email to DB", dbError);
            // Don't fail the request just because logging failed
        }

        return NextResponse.json({ message: 'Email sent successfully', success: true });
    } catch (error: any) {
        console.error('Email Error:', error);

        // Try logging failure if possible
        try {
            const formData = await req.formData().catch(() => null);
            const to = formData?.get('to') as string;
            if (to) {
                await prisma.emailLog.create({
                    data: {
                        recipient: to,
                        subject: "Quote Sending Failed",
                        status: 'FAILED',
                        sentAt: new Date()
                    }
                });
            }
        } catch (e) { }

        return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }
}
