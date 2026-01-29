import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = "logo_" + Date.now() + "_" + file.name.replaceAll(" ", "_");

        // Ensure public/uploads exists or just use public root if simple
        // For now, let's put it in public/uploads.
        // NOTE: In production (Vercel), this won't persist. But user is on Mac/Local.
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Create dir if not exists (fs/promises doesn't have existsSync, using mkdir with recursive)
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
