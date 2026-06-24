"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LockKeyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useAdminUsers, useDeleteUser, useUpdateUserRole, useBanUser, useUnbanUser, type AdminUser } from "../../_hooks/use-admin";

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const { data: users = initialUsers } = useAdminUsers(initialUsers);
  const deleteUser = useDeleteUser();
  const updateUserRole = useUpdateUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "email", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [banDialogOpen, setBanDialogOpen] = React.useState(false);
  const [banTargetUserId, setBanTargetUserId] = React.useState<string | null>(null);
  const [banTargetEmail, setBanTargetEmail] = React.useState<string | null>(null);
  const [banReasonInput, setBanReasonInput] = React.useState("");

  const handleDeleteUser = React.useCallback(async (userId: string, email: string) => {
    if (!confirm(`Are you absolutely sure you want to delete user "${email}"? All of their events and submissions will be permanently removed.`)) {
      return;
    }

    try {
      await deleteUser.mutateAsync(userId);
      toast.success("User deleted successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete user");
    }
  }, [deleteUser]);

  const handleRoleChange = React.useCallback(async (userId: string, role: "user" | "admin") => {
    try {
      await updateUserRole.mutateAsync({ userId, role });
      toast.success(`User role updated to ${role.toUpperCase()}`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update role");
    }
  }, [updateUserRole]);

  const handleBanClick = React.useCallback((userId: string, email: string) => {
    setBanTargetUserId(userId);
    setBanTargetEmail(email);
    setBanReasonInput("");
    setBanDialogOpen(true);
  }, []);

  const confirmBanUser = async () => {
    if (!banTargetUserId) return;
    try {
      await banUser.mutateAsync({ userId: banTargetUserId, reason: banReasonInput.trim() });
      toast.success("User banned successfully");
      setBanDialogOpen(false);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = React.useCallback(async (userId: string) => {
    try {
      await unbanUser.mutateAsync(userId);
      toast.success("User unbanned successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to unban user");
    }
  }, [unbanUser]);

  const columns = React.useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "email",
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="User Details" />
        ),
        cell: ({ row }) => {
          const name = row.original.name;
          const email = row.original.email;
          return (
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground text-xs">{name}</p>
              <span className="text-muted-foreground text-[11px] block">
                {email}
              </span>
            </div>
          );
        },
        enableColumnFilter: true,
        meta: {
          label: "User Details",
          placeholder: "Filter by email or name...",
          variant: "text",
        },
      },
      {
        id: "role",
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Account Role" />
        ),
        cell: ({ row }) => {
          const role = row.original.role;
          const isBanned = row.original.banned;
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                className={
                  role === "admin"
                    ? "bg-pink-500/15 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                {role.toUpperCase()}
              </Badge>
              {isBanned && (
                <Badge className="bg-red-500/15 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                  BANNED
                </Badge>
              )}
            </div>
          );
        },
        enableColumnFilter: true,
        meta: {
          label: "Role",
          variant: "select",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
      },
      {
        id: "pricingTier",
        accessorFn: (row) => (row.eventsCount > 0 ? "Pro Plan" : "Free Plan"),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Pricing Tier" />
        ),
        cell: ({ row }) => {
          const isPro = row.original.eventsCount > 0;
          return (
            <span className="text-xs text-foreground font-semibold">
              {isPro ? "Pro Plan" : "Free Plan"}
            </span>
          );
        },
        enableColumnFilter: true,
        meta: {
          label: "Pricing Tier",
          variant: "select",
          options: [
            { label: "Pro Plan", value: "Pro Plan" },
            { label: "Free Plan", value: "Free Plan" },
          ],
        },
      },
      {
        id: "eventsCount",
        accessorKey: "eventsCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Events" />
        ),
        cell: ({ row }) => (
          <div className="text-xs text-center font-bold text-foreground">
            {row.original.eventsCount}
          </div>
        ),
      },
      {
        id: "r2Prefix",
        accessorFn: (row) =>
          row.eventsCount > 0 ? `users/${row.id}/` : "Unprovisioned",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Cloudflare R2 Folder Prefix"
          />
        ),
        cell: ({ row }) => {
          const hasEvents = row.original.eventsCount > 0;
          const r2Url = row.original.r2ConsoleUrl;
          if (hasEvents && r2Url) {
            return (
              <a
                href={r2Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono"
              >
                <LockKeyIcon className="size-3.5" />
                {`users/${row.original.id}/`}
              </a>
            );
          }
          return (
            <span className="text-muted-foreground/60 text-[11px]">
              Unprovisioned
            </span>
          );
        },
      },
      {
        id: "bucketSize",
        accessorKey: "bucketSize",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="R2 Storage" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.bucketSize}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          const isBanned = user.banned;
          return (
            <div className="flex justify-end gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-foreground/80 hover:text-pink-500 hover:bg-muted cursor-pointer"
                  >
                    <PencilSimpleIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/40">
                  <DropdownMenuLabel className="text-xs">Manage Role</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(user.id, "user")}
                    className="text-xs cursor-pointer"
                  >
                    Set Role: User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(user.id, "admin")}
                    className="text-xs cursor-pointer"
                  >
                    Set Role: Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/20" />
                  {isBanned ? (
                    <DropdownMenuItem
                      onClick={() => handleUnbanUser(user.id)}
                      className="text-xs text-green-500 hover:text-green-500 hover:bg-green-500/10 cursor-pointer font-semibold"
                    >
                      Unban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleBanClick(user.id, user.email)}
                      className="text-xs text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer font-semibold"
                    >
                      Ban User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                disabled={deleteUser.isPending}
                onClick={() => handleDeleteUser(user.id, user.email)}
                className="size-8 text-foreground/80 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteUser.isPending, handleDeleteUser, handleRoleChange, handleUnbanUser, handleBanClick]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <Card className="bg-card/45 border-border/40 p-4">
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      </Card>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="text-foreground">Ban User</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Please enter a reason for banning <strong>{banTargetEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="ban-reason" className="text-xs font-semibold text-foreground">
                Reason for Ban
              </label>
              <Input
                id="ban-reason"
                placeholder="e.g. Violation of terms, spam submissions"
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                className="bg-background border-border/30 text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setBanDialogOpen(false)}
              className="text-foreground/80 hover:bg-muted text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBanUser}
              disabled={banUser.isPending}
              className="text-xs"
            >
              {banUser.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
