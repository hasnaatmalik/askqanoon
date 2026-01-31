
export interface ForumThread {
    id: string;
    title: string;
    author: string;
    role: "Lawyer" | "Student" | "Citizen";
    replies: number;
    views: number;
    category: string;
    lastActive: string;
    preview: string;
}

export const mockThreads: ForumThread[] = [
    {
        id: "1",
        title: "Procedure for Property Transfer in Punjab?",
        author: "Ali Khan",
        role: "Citizen",
        replies: 12,
        views: 345,
        category: "Property",
        lastActive: "2 hours ago",
        preview: "I recently bought a plot in Lahore and want to know the exact documents required for transfer..."
    },
    {
        id: "2",
        title: "Can a landlord increase rent by 30% suddenly?",
        author: "Sarah Ahmed",
        role: "Citizen",
        replies: 28,
        views: 890,
        category: "Tenancy",
        lastActive: "4 hours ago",
        preview: "My landlord has sent a notice for a 30% rent increase. Is this legal under Punjab Rent Laws?"
    },
    {
        id: "3",
        title: "Latest Supreme Court Judgment on Bail",
        author: "Adv. Zainab",
        role: "Lawyer",
        replies: 5,
        views: 120,
        category: "Criminal Law",
        lastActive: "1 day ago",
        preview: "Sharing the key points from the recent judgment regarding post-arrest bail in non-bailable offenses..."
    },
    {
        id: "4",
        title: "Need study resources for LAT (Law Admission Test)",
        author: "Bilal Student",
        role: "Student",
        replies: 45,
        views: 1200,
        category: "Education",
        lastActive: "30 mins ago",
        preview: "Hi everyone, I am preparing for LAT next month. Any recommended books or notes?"
    },
    {
        id: "5",
        title: "Filing an FIR against online harassment",
        author: "Anonymous",
        role: "Citizen",
        replies: 8,
        views: 230,
        category: "Cyber Crime",
        lastActive: "5 hours ago",
        preview: "Someone is blackmailing me on WhatsApp. What is the procedure to report this to FIA?"
    }
];
