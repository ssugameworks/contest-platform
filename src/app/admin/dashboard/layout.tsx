import {
  IconGridFill,
  IconMapLocationpinFill,
  IconPeople3Fill,
  IconPersonFill,
  IconTrophyFill,
  IconWonCircleFill,
} from "@karrotmarket/react-monochrome-icon";
import { Box } from "@seed-design/react";
import type { Metadata } from "next";
import { requireAdmin } from "@/entities/staff/model/session";
import { Logo } from "@/shared/ui/logo";
import { DashboardSideNav } from "@/widgets/dashboard-sidenav";

export const metadata: Metadata = { title: "관리자 대시보드" };

const NAV_ITEMS = [
  { label: "개요", href: "/admin/dashboard", icon: <IconGridFill /> },
  {
    label: "참가자 관리",
    href: "/admin/dashboard/participants",
    icon: <IconPersonFill />,
  },
  {
    label: "팀 관리",
    href: "/admin/dashboard/teams",
    icon: <IconPeople3Fill />,
  },
  {
    label: "투자자 관리",
    href: "/admin/dashboard/investors",
    icon: <IconWonCircleFill />,
  },
  {
    label: "점수 관리",
    href: "/admin/dashboard/scores",
    icon: <IconTrophyFill />,
  },
  {
    label: "부스 관리",
    href: "/admin/dashboard/booths",
    icon: <IconMapLocationpinFill />,
  },
];

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin/dashboard">) {
  await requireAdmin();
  return (
    <DashboardSideNav
      navItems={NAV_ITEMS}
      headerContent={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="36px"
          height="36px"
          borderRadius="full"
          bg="bg.neutralWeak"
        >
          <Logo width={20} height={20} />
        </Box>
      }
      dark
    >
      {children}
    </DashboardSideNav>
  );
}
