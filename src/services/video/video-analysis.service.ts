import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";

// Supported MIME types for Google Files API
const MIME_TYPE_MAP: Record<string, string> = {
    ".mp4":  "video/mp4",
    ".mpeg": "video/mpeg",
    ".mpg":  "video/mpeg",
    ".mov":  "video/quicktime",
    ".avi":  "video/x-msvideo",
    ".wmv":  "video/x-ms-wmv",
    ".webm": "video/webm",
    ".mkv":  "video/x-matroska",
    ".3gp":  "video/3gpp",
    ".flv":  "video/x-flv",
};

function getVideoMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeType = MIME_TYPE_MAP[ext];
    if (!mimeType) {
        console.warn(`Unknown file extension "${ext}", defaulting to video/mp4`);
        return "video/mp4";
    }
    return mimeType;
}

export class VideoAnalysisService {
    private genAI: GoogleGenerativeAI;
    private fileManager: GoogleAIFileManager;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY!;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
    }

    async analyzeVideo(videoPath: string, fileName: string) {
        try {
            // FIX: Detect mimeType dynamically from the actual file extension
            const mimeType = getVideoMimeType(fileName);

            // 1. Upload Video
            console.log(`Uploading video: ${videoPath} (${mimeType})...`);
            const uploadResponse = await this.fileManager.uploadFile(videoPath, {
                mimeType,
                displayName: fileName,
            });

            const file = uploadResponse.file;
            console.log(`Uploaded file ${file.displayName} as ${file.uri}`);

            // 2. Wait for processing
            let currentFile = await this.fileManager.getFile(file.name);
            let attempts = 0;
            const maxAttempts = 60; // Max 5 minutes wait

            while (currentFile.state === FileState.PROCESSING && attempts < maxAttempts) {
                console.log(`Processing video... (attempt ${attempts + 1}/${maxAttempts})`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                currentFile = await this.fileManager.getFile(file.name);
                attempts++;
            }

            if (currentFile.state === FileState.FAILED) {
                throw new Error("Video processing failed on Google's servers. The file may be corrupted or an unsupported format.");
            }

            if (currentFile.state === FileState.PROCESSING) {
                throw new Error("Video processing timed out. Please try with a shorter video.");
            }

            console.log(`Video processing complete: ${currentFile.uri}`);

            // 3. Initialize Gemini 2.5 Flash
            const model = this.genAI.getGenerativeModel({
                model: "gemini-3.6-flash",
            });

            // 4. Legal forensic analysis prompt
            const prompt = `
            Analyze this video for forensic legal evidence in the context of Pakistani law. 
            
            1. **Overview**: Briefly describe what is happening in the video.
            2. **Key Events & Timeline**: List key events with approximate timestamps.
            3. **FORENSIC REASONING**: Perform a step-by-step reasoning analysis. 
               - What is the cause and effect of the actions observed?
               - Are there any signs of coercion, hesitation, or specific intent?
               - Are there any actions that appear legally significant?
            4. **Legal Implications**: Briefly mention which areas of Pakistani Law (e.g., PPC, CrPC, PECA) might be relevant based on the actions observed. 
               *Disclaimer: This is for informational/educational purposes only and does not constitute legal advice.*
            5. **Structured Data**: Output a JSON block at the very end with this format:
               \`\`\`json
               {
                 "summary": "...",
                 "keyEvents": [{ "timestamp": "...", "event": "..." }],
                 "relevantLaws": ["..."],
                 "riskLevel": "Low | Medium | High"
               }
               \`\`\`
            `;

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: currentFile.mimeType,
                        fileUri: currentFile.uri,
                    },
                },
                { text: prompt },
            ]);

            const responseText = result.response.text();

            // Clean up the local temp file after successful upload
            try {
                fs.unlinkSync(videoPath);
            } catch (err) {
                console.error("Cleanup error:", err);
            }

            return responseText;
        } catch (error) {
            console.error("Video Analysis Error:", error);
            // Clean up temp file even on error
            try {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            } catch (_) {}
            throw error;
        }
    }
}

export const videoAnalysisService = new VideoAnalysisService();
