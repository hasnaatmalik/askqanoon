"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bell, Moon, Shield, Lock } from "lucide-react";

export default function SettingsForm() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance & Notifications</CardTitle>
                    <CardDescription>Manage how Ask Qanoon looks and communicates with you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Moon className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode</Label>
                                <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
                            </div>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Bell className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-slate-500">Receive updates about your cases and documents.</p>
                            </div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Lock className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Shield className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Change Password</Label>
                                <p className="text-sm text-slate-500">Update your password regularly to stay safe.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
