import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { getAllUsersForAdmin } from "@/app/actions/event-actions";
import { redirect } from "next/navigation";
import { UsersTable } from "./_components/users-table";

export default async function Page() {
  const result = await getAllUsersForAdmin();

  if ("error" in result) {
    redirect("/dashboard");
  }

  const dbUsers = result.users || [];

  return (
    <>
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
        <UsersTable users={dbUsers} />
      </div>
    </>
  );
}

