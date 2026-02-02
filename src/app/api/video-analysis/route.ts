import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { videoAnalysisService } from "@/services/video/video-analysis.service";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";



export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // Optional: Require authentication
        // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Create a temporary file path
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `${uuidv4()}-${file.name}`);

        // Convert File to Buffer and save to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempFilePath, buffer);

        // Analyze video
        const analysis = await videoAnalysisService.analyzeVideo(tempFilePath, file.name);

        return NextResponse.json({ analysis });
    } catch (error: any) {
        console.error("Video Analysis API error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
