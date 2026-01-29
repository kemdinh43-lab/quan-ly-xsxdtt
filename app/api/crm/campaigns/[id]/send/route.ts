import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const campaignId = params.id;
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.status === 'SENT') {
            return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
        }

        // Determine filter based on campaign target
        const whereClause: any = {
            email: { not: null },
        };

        if (campaign.targetAudience && campaign.targetAudience !== 'ALL') {
            whereClause.type = campaign.targetAudience;
        }

        // Fetch customers with filter
        const customers = await prisma.customer.findMany({
            where: whereClause,
            select: { id: true, name: true, email: true },
        });

        if (customers.length === 0) {
            return NextResponse.json({ message: 'No customers to send to' });
        }

        // Send emails
        let sentCount = 0;
        const results = [];

        for (const customer of customers) {
            if (!customer.email) continue;

            const personalizedContent = campaign.content.replace('{{name}}', customer.name);
            const personalizedHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <p>${personalizedContent.replace(/\n/g, '<br>')}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">Quý khách nhận được email này vì đã đăng ký thông tin tại Dương Thành Tín.</p>
            </div>
            `; // TODO: Add tracking pixel here <img src="${baseUrl}/api/tracking/${logId}/pixel.gif" />

            try {
                await transporter.sendMail({
                    from: `"Marketing Team" <${process.env.EMAIL_USER || 'marketing@duongthanhtin.com'}>`,
                    to: customer.email,
                    subject: campaign.subject,
                    text: personalizedContent,
                    html: personalizedHtml
                });

                // Log Success
                await prisma.emailLog.create({
                    data: {
                        campaignId,
                        recipient: customer.email,
                        subject: campaign.subject,
                        status: 'SENT',
                        opened: false,
                    }
                });
                sentCount++;
            } catch (err) {
                console.error(`Failed to send to ${customer.email}`, err);
                // Log Failure
                await prisma.emailLog.create({
                    data: {
                        campaignId,
                        recipient: customer.email,
                        subject: campaign.subject,
                        status: 'FAILED',
                        opened: false,
                    }
                });
            }
        }

        // Update campaign status
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'SENT',
                sentCount: sentCount,
            },
        });

        return NextResponse.json({ success: true, sentCount });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to send campaign', details: (error as Error).message }, { status: 500 });
    }
}
