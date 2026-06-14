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
import {
  LockKeyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useAdminUsers, type AdminUser } from "../../_hooks/use-admin";

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const { data: users = initialUsers } = useAdminUsers(initialUsers);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "email", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

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
          return (
            <Badge
              className={
                role === "admin"
                  ? "bg-pink-500/15 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {role}
            </Badge>
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
        cell: () => (
          <div className="flex justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-foreground/80 hover:text-pink-500 hover:bg-muted cursor-pointer"
            >
              <PencilSimpleIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-foreground/80 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

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
    <Card className="bg-card/45 border-border/40 p-4">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </Card>
  );
}
