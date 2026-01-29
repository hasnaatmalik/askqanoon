const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const axios = require('axios');
const https = require('https');

// Bypass SSL issues for government sites
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const documents = [
    {
        name: 'PPC',
        url: 'https://financialmonitoringunit.gov.pk/wp-content/uploads/2022/10/Pakistan-Penal-Code-1860.pdf',
        filename: 'ppc.pdf'
    },
    {
        name: 'CrPC',
        url: 'https://financialmonitoringunit.gov.pk/wp-content/uploads/2022/10/Code-of-Criminal-Procedure-1898.pdf',
        filename: 'crpc.pdf'
    },
    {
        name: 'PECA',
        url: 'https://fia.gov.pk/Prevention-of-Electronic-Crimes-Act-2016-PECA.pdf',
        filename: 'peca.pdf'
    },
    {
        name: 'FamilyLaws',
        url: 'https://www.pakistanadvocate.com/wp-content/uploads/2018/10/Muslim-Family-Laws-Ordinance-1961.pdf',
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
                httpsAgent,
                timeout: 15000 // 15s timeout
            });
            fs.writeFileSync(pdfPath, response.data);

            // Convert to Text
            console.log(`Converting ${doc.name} to text...`);
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);

            const cleanText = data.text
                .replace(/\n\s*\n/g, '\n\n')
                .replace(/\f/g, '');

            fs.appendFileSync(OUTPUT_FILE, `\n\n--- START OF ${doc.name} ---\n\n`);
            fs.appendFileSync(OUTPUT_FILE, cleanText);
            fs.appendFileSync(OUTPUT_FILE, `\n\n--- END OF ${doc.name} ---\n\n`);

            console.log(`✅ ${doc.name} added to database.`);
        } catch (error) {
            console.error(`❌ Error processing ${doc.name}:`, error.message);
        }
    }

    console.log(`\n🎉 All documents processed! Final file at: ${OUTPUT_FILE}`);
}

downloadAndConvert();
