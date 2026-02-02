// Daily legal tips for Pakistani citizens
// Tips rotate based on day of year

export interface DailyTip {
    id: string;
    title: string;
    content: string;
    source: string;
    category: "police" | "property" | "family" | "labor" | "consumer" | "general";
    icon: string;
}

export const dailyTips: DailyTip[] = [
    // Police & Rights
    {
        id: "tip-001",
        title: "Right to Remain Silent",
        content: "You have the right to remain silent during police questioning. Anything you say can be used against you in court.",
        source: "Article 13(a), Constitution of Pakistan",
        category: "police",
        icon: "Shield"
    },
    {
        id: "tip-002",
        title: "Search Without Warrant",
        content: "Police cannot search your home without a valid search warrant, except in urgent circumstances like hot pursuit.",
        source: "Section 103, CrPC",
        category: "police",
        icon: "Home"
    },
    {
        id: "tip-003",
        title: "Right to Know Charges",
        content: "If arrested, police must inform you of the grounds of arrest and allow you to consult with a lawyer.",
        source: "Article 10, Constitution of Pakistan",
        category: "police",
        icon: "Info"
    },
    {
        id: "tip-004",
        title: "FIR Registration",
        content: "Police is legally bound to register an FIR for cognizable offenses. Refusal is punishable under law.",
        source: "Section 154, CrPC",
        category: "police",
        icon: "FileText"
    },
    {
        id: "tip-005",
        title: "Bail is the Rule",
        content: "For bailable offenses, bail is a right, not a privilege. Police must release you on bail if the offense is bailable.",
        source: "Section 496, CrPC",
        category: "police",
        icon: "Scale"
    },

    // Property & Tenancy
    {
        id: "tip-006",
        title: "Tenant Eviction Notice",
        content: "Landlords must give proper notice (usually 30 days) before eviction. Illegal eviction without court order is punishable.",
        source: "Punjab Rented Premises Act",
        category: "property",
        icon: "Home"
    },
    {
        id: "tip-007",
        title: "Property Registration",
        content: "All property sales above PKR 100 must be registered. Unregistered documents cannot be produced as evidence in court.",
        source: "Section 17, Registration Act 1908",
        category: "property",
        icon: "FileText"
    },
    {
        id: "tip-008",
        title: "Rent Receipt",
        content: "Always obtain a receipt for rent payments. This serves as legal proof in case of disputes.",
        source: "Evidence Act",
        category: "property",
        icon: "Receipt"
    },

    // Family Law
    {
        id: "tip-009",
        title: "Mehr is Wife's Right",
        content: "Mehr (dower) is an absolute right of the wife, payable immediately upon marriage unless deferred by agreement.",
        source: "Muslim Family Laws Ordinance 1961",
        category: "family",
        icon: "Heart"
    },
    {
        id: "tip-010",
        title: "Child Custody",
        content: "Mother has the right to custody of minor children (7 years for boys, puberty for girls) unless proven unfit.",
        source: "Guardians and Wards Act 1890",
        category: "family",
        icon: "Users"
    },
    {
        id: "tip-011",
        title: "Divorce Notice Period",
        content: "Talaq must be followed by a 90-day notice period to the Union Council for reconciliation attempts.",
        source: "Section 7, Muslim Family Laws Ordinance",
        category: "family",
        icon: "Clock"
    },
    {
        id: "tip-012",
        title: "Right to Khula",
        content: "A wife can seek divorce (Khula) even without husband's consent by applying to Family Court.",
        source: "Muslim Family Laws Ordinance 1961",
        category: "family",
        icon: "Scale"
    },
    {
        id: "tip-013",
        title: "Maintenance Rights",
        content: "A wife is entitled to maintenance (food, clothing, residence) from her husband during and after marriage (Iddat period).",
        source: "Muslim Family Laws Ordinance",
        category: "family",
        icon: "Wallet"
    },

    // Labor Rights
    {
        id: "tip-014",
        title: "Minimum Wage",
        content: "Every worker is entitled to at least the minimum wage set by the government. Paying less is illegal.",
        source: "Minimum Wages Ordinance 1961",
        category: "labor",
        icon: "Coins"
    },
    {
        id: "tip-015",
        title: "Working Hours",
        content: "Legal working hours are 8 hours daily, 48 hours weekly. Overtime must be compensated at double the rate.",
        source: "Factories Act 1934",
        category: "labor",
        icon: "Clock"
    },
    {
        id: "tip-016",
        title: "Termination Notice",
        content: "Employers must give one month's notice or pay in lieu before terminating a permanent employee.",
        source: "Industrial & Commercial Employment Ordinance",
        category: "labor",
        icon: "AlertTriangle"
    },
    {
        id: "tip-017",
        title: "Social Security",
        content: "Workers in establishments with 5+ employees are entitled to EOBI and Social Security benefits.",
        source: "EOBI Act 1976",
        category: "labor",
        icon: "Shield"
    },

    // Consumer Rights
    {
        id: "tip-018",
        title: "Product Warranty",
        content: "Sellers must honor warranty terms. Refusing repair or replacement for defective products within warranty is illegal.",
        source: "Consumer Protection Act",
        category: "consumer",
        icon: "ShieldCheck"
    },
    {
        id: "tip-019",
        title: "Price Display",
        content: "All shops must display prices of goods. Charging more than the displayed price is punishable.",
        source: "Price Control Act",
        category: "consumer",
        icon: "Tag"
    },
    {
        id: "tip-020",
        title: "Right to Refund",
        content: "You can demand a refund for defective products or services not delivered as promised.",
        source: "Consumer Protection Act",
        category: "consumer",
        icon: "RefreshCw"
    },

    // General
    {
        id: "tip-021",
        title: "Free Legal Aid",
        content: "If you cannot afford a lawyer, you can apply for free legal aid from the District Legal Aid Authority.",
        source: "Legal Aid Rules",
        category: "general",
        icon: "Gavel"
    },
    {
        id: "tip-022",
        title: "RTI - Right to Information",
        content: "Citizens can request information from government bodies under the Right to Information Act.",
        source: "Right to Information Act 2017",
        category: "general",
        icon: "Info"
    },
    {
        id: "tip-023",
        title: "Cybercrime Reporting",
        content: "Report online harassment, fraud, or hacking to FIA Cybercrime Wing via complaint.fia.gov.pk",
        source: "PECA 2016",
        category: "general",
        icon: "Globe"
    },
    {
        id: "tip-024",
        title: "Women Protection",
        content: "Domestic violence is a criminal offense. Victims can file complaints with police or Women Protection Cells.",
        source: "Domestic Violence Act",
        category: "general",
        icon: "Heart"
    },
    {
        id: "tip-025",
        title: "Child Labor",
        content: "Employing children below 14 in hazardous industries is illegal and punishable with imprisonment.",
        source: "Employment of Children Act 1991",
        category: "labor",
        icon: "AlertTriangle"
    },
    {
        id: "tip-026",
        title: "Protection from Torture",
        content: "No person shall be subjected to torture or inhuman treatment. Evidence obtained through torture is inadmissible.",
        source: "Article 14, Constitution of Pakistan",
        category: "police",
        icon: "Shield"
    },
    {
        id: "tip-027",
        title: "Writ Petition",
        content: "Any person can file a Constitutional Writ in High Court if fundamental rights are violated.",
        source: "Article 199, Constitution of Pakistan",
        category: "general",
        icon: "Scale"
    },
    {
        id: "tip-028",
        title: "Inheritance Rights",
        content: "Under Islamic law, daughters inherit half the share of sons. Denying inheritance is against law.",
        source: "Muslim Personal Law",
        category: "family",
        icon: "Users"
    },
    {
        id: "tip-029",
        title: "Land Revenue Record",
        content: "Get verified land records (Fard) from Arazi Record Centers to confirm ownership before purchase.",
        source: "Land Revenue Act",
        category: "property",
        icon: "FileText"
    },
    {
        id: "tip-030",
        title: "Power of Attorney",
        content: "General Power of Attorney cannot be used to sell immovable property. Special PoA is required.",
        source: "Registration Act",
        category: "property",
        icon: "Key"
    }
];

// Get tip for today based on day of year
export function getTodaysTip(): DailyTip {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    return dailyTips[dayOfYear % dailyTips.length];
}

// Get random tip from category
export function getRandomTip(category?: DailyTip["category"]): DailyTip {
    const filtered = category
        ? dailyTips.filter(t => t.category === category)
        : dailyTips;

    return filtered[Math.floor(Math.random() * filtered.length)];
}
