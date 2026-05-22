"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ServerGroup } from "@/types/admin";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface ServerGroupFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Omit<ServerGroup, "id">) => void;
    availableServers: { id: string; name: string }[];
    initialData?: ServerGroup;
}

export function ServerGroupForm({ open, onOpenChange, onSubmit, availableServers, initialData }: ServerGroupFormProps) {
    const [formData, setFormData] = useState<Omit<ServerGroup, "id">>({
        name: initialData?.name || "",
        fillType: initialData?.fillType || "least-full",
        servers: initialData?.servers || [],
    });

    const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
    const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
        // Reset form
        setFormData({ name: "", fillType: "least-full", servers: [] });
        setSelectedAvailable([]);
        setSelectedAssigned([]);
    };

    const handleAddServers = () => {
        setFormData(prev => ({
            ...prev,
            servers: [...prev.servers, ...selectedAvailable]
        }));
        setSelectedAvailable([]);
    };

    const handleRemoveServers = () => {
        setFormData(prev => ({
            ...prev,
            servers: prev.servers.filter(s => !selectedAssigned.includes(s))
        }));
        setSelectedAssigned([]);
    };

    const availableServersList = availableServers.filter(s => !formData.servers.includes(s.id));
    const assignedServersList = availableServers.filter(s => formData.servers.includes(s.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Server Group</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Group Name */}
                    <div className="space-y-2">
                        <Label htmlFor="groupName" className="text-sm font-medium">Group Name *</Label>
                        <Input
                            id="groupName"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., BDIX-01"
                            required
                            className="h-11"
                        />
                    </div>

                    {/* Fill Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Fill Type</Label>
                        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="fillType"
                                    value="least-full"
                                    checked={formData.fillType === "least-full"}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fillType: e.target.value as "least-full" }))}
                                    className="mt-0.5 accent-primary h-4 w-4"
                                />
                                <div>
                                    <span className="font-medium group-hover:text-primary transition-colors">Add to the least full server</span>
                                    <p className="text-sm text-muted-foreground">New accounts will be added to the server with the most available capacity</p>
                                </div>
                            </label>
                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="fillType"
                                    value="fill-until-full"
                                    checked={formData.fillType === "fill-until-full"}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fillType: e.target.value as "fill-until-full" }))}
                                    className="mt-0.5 accent-primary h-4 w-4"
                                />
                                <div>
                                    <span className="font-medium group-hover:text-primary transition-colors">Fill active server until full then switch to next least used</span>
                                    <p className="text-sm text-muted-foreground">Fill one server completely before moving to the next</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Server Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Selected Servers</Label>
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            {/* Available Servers */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Available Servers</Label>
                                <select
                                    multiple
                                    size={8}
                                    value={selectedAvailable}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setSelectedAvailable(selected);
                                    }}
                                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {availableServersList.map(server => (
                                        <option key={server.id} value={server.id} className="py-1">
                                            {server.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Add/Remove Buttons */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddServers}
                                    disabled={selectedAvailable.length === 0}
                                    className="px-3"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemoveServers}
                                    disabled={selectedAssigned.length === 0}
                                    className="px-3"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Assigned Servers */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Assigned Servers</Label>
                                <select
                                    multiple
                                    size={8}
                                    value={selectedAssigned}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setSelectedAssigned(selected);
                                    }}
                                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {assignedServersList.map(server => (
                                        <option key={server.id} value={server.id} className="py-1">
                                            {server.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Select servers from the left list and click the arrow to add them to the group
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel Changes
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
