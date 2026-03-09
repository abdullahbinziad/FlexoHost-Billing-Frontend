"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServerConfig } from "@/types/admin";
import { Shield, Lock, Unlock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AccessControlProps {
    formData: Omit<ServerConfig, "id">;
    setFormData: React.Dispatch<React.SetStateAction<Omit<ServerConfig, "id">>>;
}

export function AccessControl({ formData, setFormData }: AccessControlProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Shield className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Access Control</CardTitle>
                        <CardDescription>SSO Permissions</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={formData.accessControl}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, accessControl: val as "unrestricted" | "restricted" }))}
                    className="grid gap-4"
                >
                    <label
                        htmlFor="unrestricted"
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                        <RadioGroupItem value="unrestricted" id="unrestricted" className="mt-1" />
                        <div className="space-y-1 flex-1">
                            <span className="font-medium">Unrestricted Access</span>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Unlock className="w-3 h-3" />
                                All admins can access
                            </p>
                        </div>
                    </label>
                    <label
                        htmlFor="restricted"
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                        <RadioGroupItem value="restricted" id="restricted" className="mt-1" />
                        <div className="space-y-1 flex-1">
                            <span className="font-medium">Restricted Access</span>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Limited by role group
                            </p>
                        </div>
                    </label>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
