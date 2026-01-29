import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// Load credentials from environment
// Load credentials from environment
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export let transporter: nodemailer.Transporter;

if (EMAIL_USER && EMAIL_PASS) {
    // Real Gmail SMTP
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
} else {
    // Mock transport for Dev/PoC (Fall back if no credentials)
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
}

export async function sendOrderUpdateEmail(
    to: string,
    customerName: string,
    orderCode: string,
    newStatus: string
) {
    const subject = `[Dương Thành Tín] Cập nhật tiến độ Đơn hàng #${orderCode}`;
    const timestamp = new Date().toLocaleString('vi-VN');

    // Map status to friendly message
    let statusMessage = "";
    switch (newStatus) {
        case 'CONFIRMED': statusMessage = "Đơn hàng của Quý khách đã được xác nhận. Chúng tôi đang lên kế hoạch sản xuất ngay."; break;
        case 'PRODUCING': statusMessage = "Tin vui! Đơn hàng đã bắt đầu được đưa vào sản xuất (Cắt/May)."; break;
        case 'DELIVERED': statusMessage = "Đơn hàng đang trên đường giao đến Quý khách."; break;
        case 'COMPLETED': statusMessage = "Đơn hàng đã hoàn thành. Cảm ơn Quý khách đã tin tưởng Dương Thành Tín."; break;
        default: statusMessage = `Trạng thái đơn hàng đã chuyển sang: ${newStatus}`;
    }

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1976d2;">Xưởng may Dương Thành Tín</h2>
        <p>Chào anh/chị <strong>${customerName}</strong>,</p>
        <p>Hệ thống xin thông báo cập nhật về đơn hàng <strong>#${orderCode}</strong>:</p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #1976d2; margin: 20px 0;">
            <p style="margin:0; font-size: 16px;"><strong>Trạng thái mới: ${newStatus}</strong></p>
            <p style="margin:5px 0 0 0;">${statusMessage}</p>
        </div>
        <p>This is an automated message from Glacial Copernicus System.</p>
    </div>
    `;

    const logContent = `
[${timestamp}] [${EMAIL_USER ? 'REAL GMAIL' : 'MOCK SEND'}]
---------------------------------------------------
TO: ${to}
SUBJECT: ${subject}
STATUS: ${newStatus}
MESSAGE: ${statusMessage}
---------------------------------------------------
`;

    // Write to public/email_logs.txt (Legacy)
    try {
        const logPath = path.join(process.cwd(), 'public', 'email_logs.txt');
        fs.appendFileSync(logPath, logContent);
    } catch (err) {
        console.error("Failed to write log file", err);
    }

    console.log(logContent);

    // Attempt to send
    try {
        await transporter.sendMail({
            from: `"Xưởng may Dương Thành Tín" <${EMAIL_USER || 'no-reply@duongthanhtin.com'}>`,
            to,
            subject,
            html: htmlBody
        });
        console.log(`[CRM] Email sent successfully to ${to}`);

        // Log to Database (Unified CRM Log)
        await prisma.emailLog.create({
            data: {
                recipient: to,
                subject: subject,
                status: 'SENT',
                opened: false, // System emails don't track open yet
                sentAt: new Date()
            }
        });

    } catch (error) {
        console.error("[CRM] Failed to send email:", error);
        // Log failure to file
        const failLog = `[${timestamp}] [ERROR] Failed to send to ${to}: ${error}\n`;
        const logPath = path.join(process.cwd(), 'public', 'email_logs.txt');
        fs.appendFileSync(logPath, failLog);

        // Log failure to Database
        await prisma.emailLog.create({
            data: {
                recipient: to,
                subject: subject,
                status: 'FAILED',
                opened: false,
                sentAt: new Date()
            }
        });
    }
}
