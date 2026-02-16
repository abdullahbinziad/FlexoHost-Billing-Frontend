"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { clientService } from "@/services/client.service";
import { authenticationService } from "@/services/authentication.service";
import { Client, User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, User as UserIcon, RefreshCw, Building, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GlobalLoader } from "@/components/shared/GlobalLoader";
import Link from "next/link";
import { Modal } from "@/components/shared/Modal";

export default function MePage() {
    const router = useRouter();
    const { user, checkAuth, isLoading: isAuthLoading } = useAuth();
    const [clientProfile, setClientProfile] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);

    // Change Password Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // User Management Form State
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
    });

    // Account Management (Client) Form State
    const [clientForm, setClientForm] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        contactEmail: "",
        address: {
            street: "",
            city: "",
            state: "",
            country: "",
            postCode: "",
        }
    });

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            // Fetch Client Profile (Account Management Data Source)
            // As requested, this comes specifically from the /clients API
            const clientResponse = await clientService.getClientProfile();
            if (clientResponse.success && clientResponse.data) {
                // The API returns data nested in a 'client' property sometimes, or directly.
                // Based on provided JSON: { data: { client: { ... } } }
                // Use a type guard or check to be safe
                const clientData = (clientResponse.data as any).client || clientResponse.data;

                setClientProfile(clientData);
                setClientForm({
                    firstName: clientData.firstName || "",
                    lastName: clientData.lastName || "",
                    companyName: clientData.companyName || "",
                    contactEmail: clientData.contactEmail || "",
                    address: {
                        street: clientData.address?.street || "",
                        city: clientData.address?.city || "",
                        state: clientData.address?.state || "",
                        country: clientData.address?.country || "",
                        postCode: clientData.address?.postCode || "",
                    }
                });
            }

            // Sync User Form with current user data (User Management Data Source)
            if (user) {
                setUserForm({
                    name: user.name || "",
                    email: user.email || "",
                });
            }

            if (!silent) toast.dismiss();
        } catch (error: any) {
            console.error("Error fetching data", error);
            // Don't show error for client profile not found if it's a new user, 
            // but usually every user should have one if registered via client flow.
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setClientForm(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setClientForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingUser(true);
        const toastId = toast.loading("Updating user profile...");

        try {
            const response = await authenticationService.updateProfile(userForm);

            if (response.success) {
                toast.success('User profile updated successfully', { id: toastId });
                // Refresh auth context to reflect changes
                await checkAuth();
            } else {
                toast.error(response.message || 'Failed to update user profile', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred updating user profile', { id: toastId });
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingClient(true);
        const toastId = toast.loading("Updating account details...");

        try {
            const response = await clientService.updateClientProfile({
                firstName: clientForm.firstName,
                lastName: clientForm.lastName,
                companyName: clientForm.companyName,
                contactEmail: clientForm.contactEmail,
                address: clientForm.address
            });

            if (response.success && response.data) {
                // Handle nested structure similar to fetch
                const clientData = (response.data as any).client || response.data;

                setClientProfile(clientData);
                // Update form with the returned data from server to ensure synchronization
                setClientForm({
                    firstName: clientData.firstName || "",
                    lastName: clientData.lastName || "",
                    companyName: clientData.companyName || "",
                    contactEmail: clientData.contactEmail || "",
                    address: {
                        street: clientData.address?.street || "",
                        city: clientData.address?.city || "",
                        state: clientData.address?.state || "",
                        country: clientData.address?.country || "",
                        postCode: clientData.address?.postCode || "",
                    }
                });
                toast.success('Account details updated successfully', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update account details', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred updating account details', { id: toastId });
        } finally {
            setIsSavingClient(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        const toastId = toast.loading("Changing password...");

        try {
            const response = await authenticationService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });

            if (response.success) {
                toast.success('Password changed successfully', { id: toastId });
                setIsPasswordModalOpen(false);
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                toast.error(response.message || 'Failed to change password', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred changing password', { id: toastId });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isAuthLoading || (isLoading && !user)) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <GlobalLoader size="lg" text="Loading profile..." />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile & Account</h1>
                    <p className="text-muted-foreground">Manage your personal profile and account settings.</p>
                </div>
                <Button variant="outline" onClick={() => fetchData(false)} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="user-management" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
                    <TabsTrigger value="user-management">User Management</TabsTrigger>
                    <TabsTrigger value="account-management">Account Management</TabsTrigger>
                </TabsList>

                {/* USER MANAGEMENT TAB */}
                <TabsContent value="user-management" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile</CardTitle>
                            <CardDescription>Update your personal information and login details.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUserSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={userForm.name}
                                            onChange={handleUserInputChange}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={userForm.email}
                                            onChange={handleUserInputChange}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="text-sm font-medium mb-3">Security</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end bg-muted/20 border-t pt-6">
                                <Button type="submit" disabled={isSavingUser}>
                                    {isSavingUser ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* ACCOUNT MANAGEMENT TAB */}
                <TabsContent value="account-management" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Manage your business/client account information.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleClientSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={clientForm.firstName}
                                            onChange={handleClientInputChange}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={clientForm.lastName}
                                            onChange={handleClientInputChange}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            value={clientForm.companyName}
                                            onChange={handleClientInputChange}
                                            placeholder="Your Company Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Billing/Contact Email</Label>
                                        <Input
                                            id="contactEmail"
                                            name="contactEmail"
                                            type="email"
                                            value={clientForm.contactEmail}
                                            onChange={handleClientInputChange}
                                            placeholder="billing@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Business Address</Label>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Input
                                            name="address.street"
                                            value={clientForm.address.street}
                                            onChange={handleClientInputChange}
                                            placeholder="Street Address"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                name="address.city"
                                                value={clientForm.address.city}
                                                onChange={handleClientInputChange}
                                                placeholder="City"
                                            />
                                            <Input
                                                name="address.state"
                                                value={clientForm.address.state}
                                                onChange={handleClientInputChange}
                                                placeholder="State"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                name="address.postCode"
                                                value={clientForm.address.postCode}
                                                onChange={handleClientInputChange}
                                                placeholder="Postal Code"
                                            />
                                            <Input
                                                name="address.country"
                                                value={clientForm.address.country}
                                                onChange={handleClientInputChange}
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end bg-muted/20 border-t pt-6">
                                <Button type="submit" disabled={isSavingClient}>
                                    {isSavingClient ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Change Password"
                size="md"
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Enter current password"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Enter new password"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Confirm new password"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPasswordModalOpen(false)}
                            disabled={isChangingPassword}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
