"use client";

import { Button } from "@/components/ui/button";
import { Plus, Clock, Delete, Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientNotesPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Staff Notes</CardTitle>
                    <p className="text-sm text-muted-foreground">Internal notes shared among staff members</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Note
                </Button>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {/* Note 1 */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-lg relative group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-500 font-semibold uppercase">
                            <span>Admin</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-normal capitalize text-yellow-600 dark:text-yellow-400">
                                <Clock className="w-3 h-3" /> 29 Dec, 2025
                            </span>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        Client called about the dedicated IP pricing. I offered a 10% discount for annual commitment. He said he will get back to us next week.
                    </p>
                </div>

                {/* Note 2 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg relative group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase">
                            <span>Support System</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-normal capitalize text-gray-400">
                                <Clock className="w-3 h-3" /> 01 Dec, 2025
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        Automatic note: Client failed fraud check initially but was manually approved after ID verification.
                    </p>
                </div>

                {/* Empty state filler if no notes */}
                {/* <div className="text-center py-8 text-gray-400 text-sm">No notes found</div> */}
            </CardContent>
        </Card>
    );
}
