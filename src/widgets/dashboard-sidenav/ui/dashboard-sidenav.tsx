"use client";

import { IconArrowLeftBracketRightLine } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Layout, useBreakpointValue } from "@seed-design/react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import {
  SideNavigationContent,
  SideNavigationFooter,
  SideNavigationGroup,
  SideNavigationHeader,
  SideNavigationInset,
  SideNavigationItemButton,
  SideNavigationProvider,
  SideNavigationRoot,
  SideNavigationTrigger,
} from "seed-design/ui/side-navigation";
import { Footer } from "@/shared/ui/footer";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface DashboardLogout {
  action: () => Promise<void>;
  redirectTo: string;
}

export function DashboardSideNav({
  navItems,
  headerContent,
  children,
  dark = false,
  logout,
}: {
  navItems: DashboardNavItem[];
  headerContent?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  logout?: DashboardLogout;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();
  const collapsedByBreakpoint = useBreakpointValue({ base: true, md: false });
  const [collapsed, setCollapsed] = useState(collapsedByBreakpoint);

  useEffect(() => {
    setCollapsed(collapsedByBreakpoint);
  }, [collapsedByBreakpoint]);

  return (
    <Layout.Root
      density="high"
      data-seed-color-mode={dark ? "dark-only" : undefined}
      style={
        dark
          ? {
              background: "var(--seed-color-bg-layer-default)",
              color: "var(--seed-color-fg-neutral)",
            }
          : undefined
      }
    >
      <SideNavigationProvider
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <SideNavigationRoot>
          <SideNavigationHeader>
            <HStack
              paddingX="x2"
              paddingY="x2"
              justify="space-between"
              align="center"
              width="full"
            >
              {!collapsed && headerContent && (
                <Box flexShrink={0}>{headerContent}</Box>
              )}
              <SideNavigationTrigger />
            </HStack>
          </SideNavigationHeader>
          <SideNavigationContent>
            <SideNavigationGroup
              items={navItems.map((item) => ({
                label: item.label,
                prefixIcon: item.icon,
                current: pathname === item.href,
                onClick: () => router.push(item.href),
              }))}
            />
          </SideNavigationContent>
          <SideNavigationFooter>
            {logout && (
              <SideNavigationItemButton
                prefixIcon={<IconArrowLeftBracketRightLine />}
                label="로그아웃"
                disabled={loggingOut}
                onClick={() =>
                  startLogout(async () => {
                    await logout.action();
                    router.push(logout.redirectTo);
                    router.refresh();
                  })
                }
              />
            )}
          </SideNavigationFooter>
        </SideNavigationRoot>
        <SideNavigationInset>
          <Layout.Content>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </Layout.Content>
        </SideNavigationInset>
      </SideNavigationProvider>
    </Layout.Root>
  );
}
