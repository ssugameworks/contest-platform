import {
  IconGridFill,
  IconMapLocationpinFill,
  IconPeople3Fill,
  IconPersonCircleFill,
  IconWonCircleFill,
} from "@karrotmarket/react-monochrome-icon";
import type { Metadata } from "next";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { requireParticipantTeamId } from "@/entities/session/model/session";
import { getTeamById } from "@/entities/team";
import { DashboardSideNav } from "@/widgets/dashboard-sidenav";
import { TeamPageFab } from "./team-page-fab";

export const metadata: Metadata = { title: "참가자 대시보드" };

const NAV_ITEMS = [
  { label: "개요", href: "/participant/dashboard", icon: <IconGridFill /> },
  {
    label: "팀 프로필",
    href: "/participant/dashboard/team",
    icon: <IconPeople3Fill />,
  },
  {
    label: "내 프로필",
    href: "/participant/dashboard/profile",
    icon: <IconPersonCircleFill />,
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
  const teamId = await requireParticipantTeamId();
  const team = await getTeamById(teamId);

  return (
    <>
      <DashboardSideNav
        navItems={NAV_ITEMS}
        headerContent={
          <Avatar
            size="36"
            src={team?.imageUrl ?? undefined}
            fallback={<IdentityPlaceholder identity="business" />}
          />
        }
      >
        {children}
      </DashboardSideNav>

      <TeamPageFab teamId={teamId} />
    </>
  );
}
