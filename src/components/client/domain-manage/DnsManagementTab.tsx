"use client";

import { useState } from "react";
import { Network, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails, DNSRecord } from "@/types/domain-manage";

interface DnsManagementTabProps {
  domain: DomainDetails;
  onDnsRecordsChange?: (records: DNSRecord[]) => void;
}

export function DnsManagementTab({ domain, onDnsRecordsChange }: DnsManagementTabProps) {
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>(domain.dnsRecords || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<DNSRecord>>({
    type: "A",
    name: "",
    value: "",
    ttl: 3600,
  });

  const handleAdd = () => {
    if (newRecord.name && newRecord.value) {
      const record: DNSRecord = {
        id: Date.now().toString(),
        type: newRecord.type || "A",
        name: newRecord.name,
        value: newRecord.value,
        ttl: newRecord.ttl || 3600,
      };
      const updated = [...dnsRecords, record];
      setDnsRecords(updated);
      setNewRecord({ type: "A", name: "", value: "", ttl: 3600 });
      setIsAdding(false);
      onDnsRecordsChange?.(updated);
    }
  };

  const handleRemove = (id: string) => {
    const updated = dnsRecords.filter((r) => r.id !== id);
    setDnsRecords(updated);
    onDnsRecordsChange?.(updated);
  };

  const handleSave = () => {
    onDnsRecordsChange?.(dnsRecords);
    // TODO: Show success message
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Network className="w-5 h-5" />
            DNS Management
          </h3>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>

        {/* Add New Record Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newRecord.type}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, type: e.target.value as DNSRecord["type"] })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="A">A</option>
                  <option value="AAAA">AAAA</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                  <option value="NS">NS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  placeholder="@"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={newRecord.value}
                  onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TTL
                </label>
                <input
                  type="number"
                  value={newRecord.ttl}
                  onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
              >
                Add Record
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewRecord({ type: "A", name: "", value: "", ttl: 3600 });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* DNS Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  TTL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {dnsRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No DNS records found
                  </td>
                </tr>
              ) : (
                dnsRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {record.type}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{record.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {record.value}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{record.ttl}</td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(record.id)}
                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Button
          onClick={handleSave}
          className="mt-4 w-full"
        >
          <Save className="w-4 h-4" />
          Save DNS Records
        </Button>
      </div>
    </div>
  );
}
