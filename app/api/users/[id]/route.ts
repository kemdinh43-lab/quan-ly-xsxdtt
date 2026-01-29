import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, role, password, employeeCode, dailyRate, allowance, otRate } = body;

        const updateData: any = {
            name,
            role,
            employeeCode,
            dailyRate: dailyRate !== undefined ? Number(dailyRate) : undefined,
            allowance: allowance !== undefined ? Number(allowance) : undefined,
            otRate: otRate !== undefined ? Number(otRate) : undefined
        };

        // If password is provided (Password Reset)
        if (password && password.length > 0) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("USER_UPDATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { id } = await context.params;
        await prisma.user.delete({
            where: { id }
        });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error("DELETE_USER_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
