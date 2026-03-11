"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCompleteProfileMutation } from "@/store/api/clientApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [completeProfile, { isLoading }] = useCompleteProfileMutation();

  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postCode, setPostCode] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await completeProfile({
        companyName: companyName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        address: {
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          postCode: postCode.trim() || undefined,
          country: country.trim() || undefined,
        },
      }).unwrap();
      toast.success("Profile completed. Welcome!");
      await checkAuth();
      router.push("/");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { message?: string } }).data?.message
        : "Failed to save profile.";
      toast.error(message);
    }
  };

  const displayName = user?.client
    ? [user.client.firstName, user.client.lastName].filter(Boolean).join(" ") || user.email
    : user?.email ?? "there";

  return (
    <div className="mx-auto max-w-xl py-8 px-4">
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <UserPlus className="h-6 w-6" />
            <CardTitle className="text-xl">Complete your profile</CardTitle>
          </div>
          <CardDescription>
            Hi {displayName}, add your business details so we can serve you better. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company (optional)"
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Address (optional)</Label>
              <div className="grid gap-2">
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street"
                  className="bg-white dark:bg-gray-900"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="bg-white dark:bg-gray-900"
                  />
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State / Region"
                    className="bg-white dark:bg-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    placeholder="Post code"
                    className="bg-white dark:bg-gray-900"
                  />
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save and continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
