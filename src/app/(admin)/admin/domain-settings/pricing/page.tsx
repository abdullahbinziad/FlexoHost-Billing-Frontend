import { DomainPricingTable } from "@/components/admin/domain-settings/DomainPricingTable";

export default function DomainPricingSetup() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                    Domains/TLDS
                </h2>
            </div>
            <DomainPricingTable />
        </div>
    );
}
