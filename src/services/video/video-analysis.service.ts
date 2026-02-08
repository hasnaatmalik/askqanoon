import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";

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
            // 1. Upload Video
            console.log(`Uploading video: ${videoPath}...`);
            const uploadResponse = await this.fileManager.uploadFile(videoPath, {
                mimeType: "video/mp4",
                displayName: fileName,
            });

            const file = uploadResponse.file;
            console.log(`Uploaded file ${file.displayName} as ${file.uri}`);

            // 2. Wait for processing
            let currentFile = await this.fileManager.getFile(file.name);
            while (currentFile.state === FileState.PROCESSING) {
                console.log("Processing video...");
                await new Promise((resolve) => setTimeout(resolve, 5000));
                currentFile = await this.fileManager.getFile(file.name);
            }

            if (currentFile.state === FileState.FAILED) {
                throw new Error("Video processing failed.");
            }

            console.log(`Video processing complete: ${currentFile.uri}`);

            // 3. Initialize Gemini 2.5 Flash (Free Tier Compatible)
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
            });

            // 4. Prompting with 'Deep Think' context
            const prompt = `
            Analyze this video for forensic legal evidence in the context of Pakistani law. 
            
            1. Identify the specific user interactions and actions shown on screen.
            2. FORENSIC REASONING (DEEP THINK): Perform a step-by-step reasoning analysis. 
               - What is the cause and effect of the actions observed?
               - Are there any signs of coercion, hesitation, or specific intent?
               - Why did the individuals act the way they did at key timestamps?
            3. Legal Implications: Briefly mention which areas of Pakistani Law (e.g., PPC, CrPC) might be relevant based on the actions (Disclaimer: This is for informational purposes).
            4. Output the technical data (timestamps, objects, actions) in a structured JSON block at the end.
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

            // Clean up the local file after upload
            try {
                fs.unlinkSync(videoPath);
            } catch (err) {
                console.error("Cleanup error:", err);
            }

            return responseText;
        } catch (error) {
            console.error("Video Analysis Error:", error);
            throw error;
        }
    }
}

export const videoAnalysisService = new VideoAnalysisService();
