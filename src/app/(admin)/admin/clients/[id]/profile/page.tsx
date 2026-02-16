"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function ClientProfilePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Client Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input defaultValue="Moshiur" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input defaultValue="Rahman" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input defaultValue="CareUp Beauty Store" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input defaultValue="moshiur.r4n@gmail.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input defaultValue="+880 1700000000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select className="w-full">
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Closed</option>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input defaultValue="Dhaka, Bangladesh" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline">Reset Changes</Button>
                        <Button>Save Changes</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
