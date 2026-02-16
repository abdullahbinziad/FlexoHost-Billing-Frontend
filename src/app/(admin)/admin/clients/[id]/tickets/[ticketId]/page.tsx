"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, User, MessageCircle, MoreHorizontal, Paperclip, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TicketDetailsPage({ params }: { params: { id: string; ticketId: string } }) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 hover:pl-2 transition-all"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tickets
                </Button>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        {`#${params.ticketId} - Server Down Issue`}
                        <Badge className="bg-green-500 hover:bg-green-600">Open</Badge>
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>Department: Support</span>
                        <span>•</span>
                        <span>Priority: High</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="open">
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Merge Ticket</DropdownMenuItem>
                            <DropdownMenuItem>Block Sender</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete Ticket</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Conversation Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Message Input */}
                    <Card>
                        <CardHeader className="py-3 bg-gray-50 dark:bg-gray-800/50 border-b">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Reply to Ticket
                            </h3>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <Textarea placeholder="Type your reply here..." className="min-h-[150px]" />
                            <div className="flex justify-between items-center">
                                <Button variant="outline" size="sm">
                                    <Paperclip className="w-4 h-4 mr-2" /> Attach Files
                                </Button>
                                <Button>
                                    <Send className="w-4 h-4 mr-2" /> Send Reply
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messages */}
                    <div className="space-y-4">
                        {/* Staff Reply */}
                        <Card className="border-blue-100 dark:border-blue-900 overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Support Staff (Admin)</div>
                                        <div className="text-xs text-gray-500">Staff Member</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 sm:text-right mt-2 sm:mt-0">
                                    15 Jan, 2024 at 10:30 AM
                                </div>
                            </div>
                            <CardContent className="p-4 text-sm leading-relaxed">
                                <p>Hello Moshiur,</p>
                                <p className="mt-2">Thank you for contacting us. We are looking into the server issue. It seems like a temporary load spike.</p>
                                <p className="mt-2">We will update you shortly.</p>
                                <p className="mt-4">Best regards,<br />Support Team</p>
                            </CardContent>
                        </Card>

                        {/* User Message */}
                        <Card className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Moshiur Rahman</div>
                                        <div className="text-xs text-gray-500">Client</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 sm:text-right mt-2 sm:mt-0">
                                    15 Jan, 2024 at 10:15 AM
                                </div>
                            </div>
                            <CardContent className="p-4 text-sm leading-relaxed">
                                <p>Hi,</p>
                                <p className="mt-2">My website nazrulinstitute.com is loading very slowly. Can you check?</p>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Ticket Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Department</span>
                                <span className="font-medium">Technical Support</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Submitted</span>
                                <span className="font-medium">15 Jan, 2024</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Last Updated</span>
                                <span className="font-medium">15 Jan, 2024 10:30 AM</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Related Service</span>
                                <span className="font-medium text-blue-600">Premium Shared Hosting</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
