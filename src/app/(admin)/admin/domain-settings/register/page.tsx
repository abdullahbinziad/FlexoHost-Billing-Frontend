"use client";

import { RegistrarConfigCard } from "@/components/admin/domain-settings/RegistrarConfigCard";

export default function DomainRegisterConfig() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                    Domain Registrars
                </h2>
            </div>

            <div className="space-y-4">
                <RegistrarConfigCard
                    name="Namely Partner"
                    logoText="namely"
                    description="Namely Partner API Integration for domain registration and management"
                    isActive={true}
                    onActivate={() => { }}
                    onDeactivate={() => { }}
                    configFields={[
                        {
                            key: "apiKey",
                            label: "ApiKey",
                            type: "text",
                            value: "pk_A2brTCFXDPWaK4ZSnjXNrTfNyMMMc8hNrPFMLDjq", // Use mock value from image
                            helperText: "Enter your Namely Partner API Key. Connection will be validated on first API call."
                        },
                        {
                            key: "testMode",
                            label: "TestMode",
                            type: "checkbox",
                            value: false,
                            helperText: "Enable test mode (use test environment)"
                        },
                        {
                            key: "docUrl",
                            label: "DocumentListUrl",
                            type: "text",
                            value: "",
                            helperText: "URL for Required Documents list (will be shown as a link in domain registration form)"
                        }
                    ]}
                />

                <RegistrarConfigCard
                    name="Dynadot"
                    logoText="Dynadot"
                    description="Don't have a Dynadot Account yet? Get one here: www.dynadot.com"
                    isActive={true}
                    onActivate={() => { }}
                    onDeactivate={() => { }}
                    configFields={[
                        {
                            key: "apiKey",
                            label: "API Key",
                            type: "password",
                            value: "********************************",
                            helperText: "Enter your Dynadot API Key here"
                        },
                        {
                            key: "username",
                            label: "Username",
                            type: "text",
                            value: "flexsoftr",
                            helperText: "Enter your Dynadot Reseller Account Username here"
                        },
                        {
                            key: "coupon",
                            label: "Coupon",
                            type: "textarea",
                            value: "OCTCOM25\nFALLMOVE25",
                            helperText: "Enter your Dynadot Coupons, one coupon per line (Split by new line). Only the first valid coupon will be used for the order. If no valid coupon found for the order, the order will be processed without any coupon."
                        }
                    ]}
                />

                <RegistrarConfigCard
                    name="GoDaddy"
                    logoText="GoDaddy"
                    description="GoDaddy Domain Registrar Integration"
                    isActive={false}
                    onActivate={() => { }}
                    onDeactivate={() => { }}
                    configFields={[
                        { key: "key", label: "API Key", type: "text", value: "" },
                        { key: "secret", label: "API Secret", type: "password", value: "" }
                    ]}
                />
            </div>
        </div>
    );
}
