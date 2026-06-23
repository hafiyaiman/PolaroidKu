"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, LockKeyIcon } from "@phosphor-icons/react";
import { UsersTable } from "./_components/users-table";
import { useAdminUsers } from "../_hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: users, isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading directory...</p>
        </div>
      </div>
    );
  }

  if (error || !users) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <Card className="max-w-md w-full border-border/40 bg-card/60 text-center shadow-lg">
          <CardHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="size-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
              <LockKeyIcon className="size-6" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground mt-2">
              Super Admin Access Required
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground px-2">
              You do not have the required permissions to view the user management directory. Access is restricted to Super Administrators only.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button className="cursor-pointer text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inspect registered accounts, change roles, and oversee event Cloudflare R2 storage mappings.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 flex items-center gap-1">
          <ShieldCheckIcon className="size-4" />
          Super Admin Access
        </Badge>
      </div>

      {/* User directory table */}
      <UsersTable users={users} />
    </div>
  );
}
