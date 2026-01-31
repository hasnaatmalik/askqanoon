
export interface TemplateField {
    id: string;
    label: string;
    type: "text" | "date" | "number" | "textarea";
    placeholder?: string;
}

export interface DocumentTemplate {
    id: string;
    title: string;
    description: string;
    fields: TemplateField[];
    content: (data: any) => string;
}

export const templates: DocumentTemplate[] = [
    {
        id: "rent-agreement",
        title: "Residential Rent Agreement",
        description: "Standard rental contract for a house or apartment.",
        fields: [
            { id: "landlordName", label: "Landlord Name", type: "text", placeholder: "e.g. Aslam Khan" },
            { id: "tenantName", label: "Tenant Name", type: "text", placeholder: "e.g. Bilal Ahmed" },
            { id: "propertyAddress", label: "Property Address", type: "text", placeholder: "e.g. House 10, St 5, F-10/2, Islamabad" },
            { id: "rentAmount", label: "Monthly Rent (PKR)", type: "number", placeholder: "e.g. 50000" },
            { id: "startDate", label: "Agreement Start Date", type: "date" },
            { id: "duration", label: "Duration (Months)", type: "number", placeholder: "e.g. 11" },
        ],
        content: (data) => `
TENANCY AGREEMENT

This Agreement is made on this day of ${new Date().toLocaleDateString()} between:

LANDLORD: ${data.landlordName || "[Landlord Name]"}
AND
TENANT: ${data.tenantName || "[Tenant Name]"}

1. PROPERTY
The Landlord agrees to let out the property situated at:
${data.propertyAddress || "[Address]"}

2. TERM
The tenancy shall be for a period of ${data.duration || "11"} months, commencing from ${data.startDate || "[Date]"}.

3. RENT
The monthly rent shall be PKR ${data.rentAmount || "[Amount]"}, payable in advance by the 5th of each month.

4. UTILITIES
The Tenant shall pay all utility bills (Electricity, Gas, Water) according to consumption.

5. TERMINATION
Either party may terminate this agreement by giving one month's notice in writing.

Signed,

____________________
(Landlord)

____________________
(Tenant)
        `
    },
    {
        id: "general-affidavit",
        title: "General Affidavit",
        description: "A sworn statement of facts for general legal use.",
        fields: [
            { id: "deponentName", label: "Deponent Name", type: "text", placeholder: "Your Full Name" },
            { id: "fatherName", label: "Father's Name", type: "text", placeholder: "Father's Name" },
            { id: "cnic", label: "CNIC Number", type: "text", placeholder: "00000-0000000-0" },
            { id: "address", label: "Residential Address", type: "text", placeholder: "Full Address" },
            { id: "statement", label: "Statement of Fact", type: "textarea", placeholder: "I hereby declare that..." },
        ],
        content: (data) => `
AFFIDAVIT

I, ${data.deponentName || "[Name]"}, S/O ${data.fatherName || "[Father Name]"}, holder of CNIC No. ${data.cnic || "[CNIC]"}, resident of ${data.address || "[Address]"}, do hereby solemnly affirm and declare as under:

1. That I am a law-abiding citizen of Pakistan.

2. ${data.statement || "[Your Statement Here]"}

3. That the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing has been concealed herein.

DEPONENT

____________________
${data.deponentName || "[Name]"}
CNIC: ${data.cnic || "[CNIC]"}

Date: ${new Date().toLocaleDateString()}
        `
    },
    {
        id: "resignation",
        title: "Resignation Letter",
        description: "Professional resignation letter for employment.",
        fields: [
            { id: "employeeName", label: "Your Name", type: "text", placeholder: "Full Name" },
            { id: "managerName", label: "Manager's Name", type: "text", placeholder: "Manager Name" },
            { id: "companyName", label: "Company Name", type: "text", placeholder: "Company Name" },
            { id: "lastDay", label: "Last Working Day", type: "date" },
            { id: "reason", label: "Reason (Optional)", type: "textarea", placeholder: "I have decided to pursue other opportunities..." },
        ],
        content: (data) => `
Date: ${new Date().toLocaleDateString()}

To,
${data.managerName || "[Manager Name]"}
${data.companyName || "[Company Name]"}

Subject: Resignation from Employment

Dear ${data.managerName || "Sir/Madam"},

Please accept this letter as formal notification that I am resigning from my position at ${data.companyName || "[Company]"}. My last day will be ${data.lastDay || "[Date]"}.

${data.reason ? data.reason : "I would like to thank you for the opportunity to have worked at this company giving me the chance to grow and develop my career."}

I wish the company every success in the future.

Sincerely,

____________________
${data.employeeName || "[Your Name]"}
        `
    }
];
