import fs from 'fs';
import path from 'path';
import { PDFParse as pdf } from 'pdf-parse';
import axios from 'axios';
import https from 'https';

// Bypass SSL issues for government sites
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const documents = [
    {
        name: 'PPC',
        url: 'https://fmu.gov.pk/docs/laws/Pakistan%20Penal%20Code.pdf',
        filename: 'ppc.pdf'
    },
    {
        name: 'CrPC',
        url: 'http://www.fmu.gov.pk/docs/laws/Code_of_criminal_procedure_1898.pdf',
        filename: 'crpc.pdf'
    },
    {
        name: 'PECA',
        url: 'https://fia.gov.pk/test/Prevention_of_Electronic_Crimes_Act_2016.pdf', // Updated URL
        filename: 'peca.pdf'
    },
    {
        name: 'FamilyLaws',
        url: 'https://www.molaw.gov.pk/uploads/documents/1961.pdf',
        filename: 'family_laws.pdf'
    }
];

const DOWNLOAD_DIR = path.join(process.cwd(), 'data', 'raw');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'laws.txt');

async function downloadAndConvert() {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }

    // Clear existing laws.txt
    fs.writeFileSync(OUTPUT_FILE, '--- ASKQANOON CONSOLIDATED LEGAL DATABASE ---\n\n');

    for (const doc of documents) {
        console.log(`\n--- Processing ${doc.name} ---`);
        const pdfPath = path.join(DOWNLOAD_DIR, doc.filename);

        try {
            // Download PDF
            console.log(`Downloading ${doc.name}...`);
            const response = await axios({
                url: doc.url,
                method: 'GET',
                responseType: 'arraybuffer',
                httpsAgent, // Use the bypass agent
            });
            fs.writeFileSync(pdfPath, response.data);

            // Convert to Text
            console.log(`Converting ${doc.name} to text...`);
            const dataBuffer = fs.readFileSync(pdfPath);
            const parser = new pdf({ data: dataBuffer });
            const data = await parser.getText();

            const cleanText = data.text
                .replace(/\n\s*\n/g, '\n\n')
                .replace(/\f/g, '');

            fs.appendFileSync(OUTPUT_FILE, `\n\n--- START OF ${doc.name} ---\n\n`);
            fs.appendFileSync(OUTPUT_FILE, cleanText);
            fs.appendFileSync(OUTPUT_FILE, `\n\n--- END OF ${doc.name} ---\n\n`);

            console.log(`✅ ${doc.name} added to database.`);
        } catch (error: any) {
            console.error(`❌ Error processing ${doc.name}:`, error.message);
        }
    }

    console.log(`\n🎉 All documents processed! Final file at: ${OUTPUT_FILE}`);
}

downloadAndConvert();
