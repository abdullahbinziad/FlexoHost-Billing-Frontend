"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, MoreHorizontal, Mail, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetClientByIdQuery } from "@/store/api/clientApi";
import { Loader2 } from "lucide-react";

function formatAddress(address: { street?: string; city?: string; state?: string; postCode?: string; country?: string } | undefined): string {
  if (!address) return "—";
  const parts = [address.street, address.city, address.state, address.postCode, address.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function ClientContactsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const { data: client, isLoading, error } = useGetClientByIdQuery(clientId, { skip: !clientId });

  const addressStr = formatAddress(client?.address);
  const name = [client?.firstName, client?.lastName].filter(Boolean).join(" ") || "—";

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Contacts</CardTitle>
          <p className="text-sm text-muted-foreground">Primary contact and address for this client</p>
        </div>
        <Button disabled title="Coming soon">
          <Plus className="w-4 h-4 mr-2" />
          Add New Contact
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : error || !client ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-destructive">
                    Failed to load client.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
                      {addressStr !== "—" && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {addressStr}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {client.contactEmail && (
                        <span className="text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {client.contactEmail}
                        </span>
                      )}
                      {client.phoneNumber && (
                        <span className="text-xs flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3 text-gray-400" /> {client.phoneNumber}
                        </span>
                      )}
                      {!client.contactEmail && !client.phoneNumber && "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Owner / Main Contact</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/clients/${clientId}/profile`}>Edit in Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" disabled>Delete Contact</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
