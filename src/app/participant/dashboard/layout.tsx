import {
  IconGridFill,
  IconMapLocationpinFill,
  IconPeople3Fill,
  IconWonCircleFill,
} from "@karrotmarket/react-monochrome-icon";
import type { Metadata } from "next";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { getTeamById, PLACEHOLDER_TEAM_ID } from "@/entities/team";
import { DashboardSideNav } from "@/widgets/dashboard-sidenav";

export const metadata: Metadata = { title: "참가자 대시보드" };

const NAV_ITEMS = [
  { label: "개요", href: "/participant/dashboard", icon: <IconGridFill /> },
  {
    label: "팀 프로필",
    href: "/participant/dashboard/team",
    icon: <IconPeople3Fill />,
  },
  {
    label: "투자 현황",
    href: "/participant/dashboard/investment",
    icon: <IconWonCircleFill />,
  },
  {
    label: "부스 위치",
    href: "/participant/dashboard/booth",
    icon: <IconMapLocationpinFill />,
  },
];

export default async function DashboardLayout({
  children,
}: LayoutProps<"/participant/dashboard">) {
  const team = await getTeamById(PLACEHOLDER_TEAM_ID);

  return (
    <DashboardSideNav
      navItems={NAV_ITEMS}
      headerContent={
        <Avatar
          size="36"
          src={team?.imageUrl ?? undefined}
          fallback={<IdentityPlaceholder />}
        />
      }
    >
      {children}
    </DashboardSideNav>
  );
}
