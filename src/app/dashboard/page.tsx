import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, FileText, Scale, ExternalLink, Search, Users, BookOpen } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {user?.name || "User"}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Your personal legal assistant dashboard.
                    </p>
                </div>
                <Link href="/chat">
                    <Button className="bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-900/20">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start New Chat
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Cards */}
                <Card className="shadow-md border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-slate-500">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-md border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved Documents</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-slate-500">Legal forms & drafts</p>
                    </CardContent>
                </Card>
                <Card className="shadow-md border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <Scale className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-slate-500">Free Tier</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="shadow-md border border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest legal queries and actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { title: "How to file an FIR?", date: "2 hours ago", type: "Chat" },
                            { title: "Divorce procedure in Punjab", date: "Yesterday", type: "Chat" },
                            { title: "Tenant rights inquiry", date: "3 days ago", type: "Chat" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.date}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ExternalLink className="h-4 w-4 text-slate-400" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Feature Grid */}
                <Card className="shadow-md border border-slate-200 dark:border-slate-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Legal Tools & Services</CardTitle>
                        <CardDescription>Access our full suite of AI-powered legal assistance tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/chat" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-green-500/50 hover:bg-green-50/50 transition-all cursor-pointer h-full">
                                <MessageSquare className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ask Qanoon AI</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Get instant answers to legal queries</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/documents" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-blue-50/50 transition-all cursor-pointer h-full">
                                <FileText className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Legal Docs</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Generate basic drafts instantly</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/inheritance" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500/50 hover:bg-purple-50/50 transition-all cursor-pointer h-full">
                                <Scale className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inheritance</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Calculate Islamic inheritance shares</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/caselaw" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-50/50 transition-all cursor-pointer h-full">
                                <Search className="h-8 w-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Case Search</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Find relevant court judgments</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/forum" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-pink-500/50 hover:bg-pink-50/50 transition-all cursor-pointer h-full">
                                <Users className="h-8 w-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Community</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Anonymous advice forum</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/rights" className="group">
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500/50 hover:bg-teal-50/50 transition-all cursor-pointer h-full">
                                <BookOpen className="h-8 w-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Rights</span>
                                <p className="text-xs text-slate-500 text-center mt-1">Daily legal tips & education</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
