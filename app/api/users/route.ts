import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeCode: true,
                dailyRate: true,
                allowance: true,
                otRate: true,
                createdAt: true,
                updatedAt: true,
                // Do NOT select password
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    // const session = await getServerSession(authOptions);
    // if (!session) return new NextResponse("Unauthorized", { status: 401 });
    // Allow creation without auth for initial setup if needed, but safer to require auth

    try {
        const body = await request.json();
        const { name, email, password, role, employeeCode, dailyRate, allowance, otRate } = body;

        if (!name || !email || !password || !role) {
            return new NextResponse("Missing data", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                employeeCode,
                dailyRate: dailyRate || 0,
                allowance: allowance || 0,
                otRate: otRate || 1.5
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error("USER_CREATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
