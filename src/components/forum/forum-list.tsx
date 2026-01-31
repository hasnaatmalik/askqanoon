"use client";

import { mockThreads } from "@/data/forum/mock-threads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, Clock, PlusCircle, User } from "lucide-react";
import { useState } from "react";

export default function ForumList() {
    const [threads, setThreads] = useState(mockThreads);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Discussions</h3>
                    <p className="text-sm text-slate-500">Join the conversation with the community.</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Topic
                </Button>
            </div>

            <div className="space-y-4">
                {threads.map((thread) => (
                    <Card key={thread.id} className="hover:border-green-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {thread.category}
                                        </Badge>
                                        <span className="text-xs text-slate-400 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" /> {thread.lastActive}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-green-700 flex items-center gap-2">
                                        {thread.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {thread.preview}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                            <User className="h-3 w-3 mr-1" />
                                            {thread.author} • <span className="text-green-600 font-medium ml-1">{thread.role}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[100px]">
                                    <div className="flex flex-col items-center text-slate-500">
                                        <div className="flex items-center gap-1 font-semibold text-lg text-slate-700">
                                            <MessageSquare className="h-4 w-4" />
                                            {thread.replies}
                                        </div>
                                        <span className="text-xs">Replies</span>
                                    </div>
                                    <div className="flex flex-col items-center text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {thread.views}
                                        </div>
                                        <span className="text-xs">Views</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
