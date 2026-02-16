import { User, MapPin, Mail, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Client {
    id: string | number;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    status: string;
    address?: string;
    created?: string;
}

export function ClientDetailsHeader({ client }: { client: Client }) {
    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {client.firstName} {client.lastName}
                            </h1>
                            <Badge className={client.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}>
                                {client.status}
                            </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm mt-1">
                            {client.companyName ? <>{client.companyName} <span className="text-gray-300">|</span></> : null} Client ID: {client.id}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {client.email}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {client.address || "No Address Provided"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full lg:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Log In as Client
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1 lg:flex-none">
                        Close Account
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900 shadow-sm">
                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">Income</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">৳0.00</div>
                </Card>
                <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900 shadow-sm">
                    <div className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold">Credit Balance</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">৳0.00</div>
                </Card>
                <Card className="p-3 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900 shadow-sm">
                    <div className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold">Unpaid Invoices</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">0</div>
                </Card>
                <Card className="p-3 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900 shadow-sm">
                    <div className="text-xs text-purple-600 dark:text-purple-400 uppercase font-semibold">Active Services</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">2</div>
                </Card>
            </div>
        </div>
    );
}
