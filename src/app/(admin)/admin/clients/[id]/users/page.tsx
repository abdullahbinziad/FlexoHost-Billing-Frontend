"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, User, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export default function ClientUsersPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const { data: client, isLoading, error } = useGetClientByIdQuery(clientId, { skip: !clientId });

  const email = client?.contactEmail ?? (client?.user as { email?: string })?.email;
  const displayName = [client?.firstName, client?.lastName].filter(Boolean).join(" ") || "Owner";
  const isActive = (client?.user as { active?: boolean })?.active !== false;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Associated Users</CardTitle>
          <p className="text-sm text-muted-foreground">Users who can access this client profile</p>
        </div>
        <Button disabled title="Coming soon">
          <Plus className="w-4 h-4 mr-2" />
          Invite New User
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : error || !client ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    Failed to load client.
                  </TableCell>
                </TableRow>
              ) : !email ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No user linked to this client.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{displayName} (Owner)</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                      All Permissions
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>Manage Permissions</DropdownMenuItem>
                        <DropdownMenuItem disabled>Change Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" disabled>Remove Access</DropdownMenuItem>
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
