"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChartPieIcon,
  CalendarIcon,
  CreditCardIcon,
  GearIcon,
  ShieldIcon,
  CameraIcon,
  UsersIcon,
  CoinsIcon,
  MonitorIcon,
  LifebuoyIcon,
  PaperPlaneTiltIcon,
  CaretRightIcon
} from "@phosphor-icons/react"

interface SidebarMenuItemType {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface SidebarUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string | null;
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
}) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    const roleIsAdmin = user?.role === "admin" || user?.email?.includes("admin")
    setIsAdmin(roleIsAdmin)
  }, [user])

  const userMenu: SidebarMenuItemType[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <ChartPieIcon className="size-4" />,
      isActive: pathname === "/dashboard",
    },
    {
      title: "My Events",
      url: "/dashboard/events",
      icon: <CalendarIcon className="size-4" />,
      isActive: pathname.startsWith("/dashboard/events"),
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: <CreditCardIcon className="size-4" />,
      isActive: pathname === "/dashboard/billing",
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <GearIcon className="size-4" />,
      isActive: pathname === "/dashboard/settings",
    },
  ]

  const adminMenu = [
    {
      title: "Overview",
      url: "/dashboard/admin",
      icon: <MonitorIcon className="size-4" />,
      isActive: pathname === "/dashboard/admin",
    },
    {
      title: "User Directory",
      url: "/dashboard/admin/users",
      icon: <UsersIcon className="size-4" />,
      isActive: pathname === "/dashboard/admin/users",
    },
    {
      title: "Billing Control",
      url: "/dashboard/admin/billing",
      icon: <CoinsIcon className="size-4" />,
      isActive: pathname === "/dashboard/admin/billing",
    },
  ]

  const secondaryMenu = [
    {
      title: "Support",
      url: "#",
      icon: <LifebuoyIcon className="size-4" />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <PaperPlaneTiltIcon className="size-4" />,
    },
  ]

  const clientUser = {
    name: user?.name || user?.email?.split("@")[0] || "Guest User",
    email: user?.email || "guest@example.com",
    avatar: user?.image || "",
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CameraIcon className="size-5" weight="fill" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">PolaroidKu</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isAdmin ? "Super Admin Console" : "Digital Guestbook"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* User Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {userMenu.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="absolute right-2 top-1/2 -translate-y-1/2 size-6 p-0 flex items-center justify-center hover:bg-muted rounded-md group-data-[state=open]/collapsible:rotate-90 transition-transform">
                          <CaretRightIcon className="size-3" />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Super Admin Navigation Group */}
        {isAdmin && (
          <SidebarGroup className="border-t border-sidebar-border/50 pt-4">
            <SidebarGroupLabel className="text-primary font-semibold flex items-center gap-1.5">
              <ShieldIcon className="size-3.5" weight="fill" />
              Super Admin
            </SidebarGroupLabel>
            <SidebarMenu>
              {adminMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Role Toggle for Testing */}
        <SidebarGroup className="mt-auto border-t border-sidebar-border/30 pt-4">
          <div className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium">Role: {isAdmin ? "Admin" : "User"}</span>
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className="text-[10px] px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-semibold border border-primary/20 active:scale-95 transition-all cursor-pointer"
              >
                Toggle Mode
              </button>
            </div>
          </div>
        </SidebarGroup>

        {/* Secondary Navigation Group */}
        <SidebarGroup className="pt-2">
          <SidebarMenu>
            {secondaryMenu.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={clientUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
