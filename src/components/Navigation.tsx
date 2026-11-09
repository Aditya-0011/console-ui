import { Link, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
  AppWindow,
  FolderKanban,
  KeyRound,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useDataMutation } from "@/api/handler";
import { useAuth } from "@/contexts/AuthContext";

import { type SimpleResponse } from "@/lib/types";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavigationOption = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  needsApiKey?: boolean;
};

const accountItems: NavigationOption[] = [
  { title: "Apps", url: "/", icon: AppWindow },
  { title: "Security", url: "/security", icon: ShieldCheck },
  { title: "API Key", url: "/api-key", icon: KeyRound, needsApiKey: true },
];

const adminItems: NavigationOption[] = [
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Projects", url: "/admin/projects", icon: FolderKanban },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavigationOption[];
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2 text-lg text-neutral-400 group-data-[collapsible=icon]:mb-0">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className="gap-4 text-base hover:bg-neutral-800"
                  render={
                    <Link
                      onClick={() => setOpenMobile(false)}
                      to={item.url}
                      aria-current={isActive ? "page" : undefined}
                    />
                  }
                >
                  <item.icon
                    aria-hidden="true"
                    className="size-10 text-lime-500"
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function Navigation() {
  const { logout, identity, isAdmin, canUseApiKey } = useAuth();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useDataMutation<null, SimpleResponse>(
    "auth",
    "/logout",
    false,
    {
      onSuccess: () => {
        queryClient.clear();
        logout();
      },
    },
  );

  const visibleAccountItems = accountItems.filter(
    (item) => !item.needsApiKey || canUseApiKey,
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-neutral-800 bg-neutral-950 text-white"
    >
      <SidebarContent className="bg-neutral-950 py-1">
        <NavGroup
          label="Links"
          items={visibleAccountItems}
          pathname={pathname}
        />
        {isAdmin && (
          <NavGroup label="Admin" items={adminItems} pathname={pathname} />
        )}
      </SidebarContent>
      <SidebarFooter className="bg-neutral-950">
        {identity && (
          <p
            className="text-muted-foreground truncate px-2 text-xs group-data-[collapsible=icon]:hidden"
            title={identity.email}
            translate="no"
          >
            {identity.email}
          </p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="gap-3 text-base text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
              onClick={() => mutate(null)}
              disabled={isPending}
            >
              <LogOut aria-hidden="true" className="size-10" />
              <span>{isPending ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
