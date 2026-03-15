import { User, MapPin, Mail, RefreshCw, Shield, Send } from "lucide-react";
import { devLog } from "@/lib/devLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRegenerateSupportPinForClientMutation } from "@/store/api/clientApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Client {
    id: string | number;
    _id?: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    status: string;
    address?: string;
    created?: string;
    supportPin?: string;
}

interface ClientDetailsHeaderProps {
    client: Client;
    onSendEmail?: () => void;
}

export function ClientDetailsHeader({ client, onSendEmail }: ClientDetailsHeaderProps) {
    const clientId = client._id ?? String(client.id);
    const [regenerateSupportPin, { isLoading: isRegenerating }] = useRegenerateSupportPinForClientMutation();

    const handleRegenerateSupportPin = async () => {
        try {
            await regenerateSupportPin({ clientId }).unwrap();
            toast.success("Support PIN regenerated for this client.");
        } catch (error) {
            devLog(error);
            toast.error("Failed to regenerate Support PIN.");
        }
    };

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
                            {client.created && <div>Joined {client.created}</div>}
                        </div>
                    </div>
                </div>

                <div className="flex w-full lg:w-auto justify-end items-center gap-2">
                    {onSendEmail && (
                        <Button variant="outline" size="sm" onClick={onSendEmail}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                    )}
                    <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs bg-muted/40 border-muted-foreground/20 text-muted-foreground">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">Support PIN:</span>
                        <span className="tabular-nums tracking-[0.15em] text-foreground">
                            {client.supportPin ?? "------"}
                        </span>
                        <button
                            type="button"
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
                            onClick={handleRegenerateSupportPin}
                            disabled={isRegenerating}
                            title="Regenerate Support PIN for this client"
                        >
                            <RefreshCw className={cn("w-3 h-3", isRegenerating && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
