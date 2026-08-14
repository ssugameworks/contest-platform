import { IconCheckmarkClipboardLine } from "@karrotmarket/react-monochrome-icon";
import type { Metadata } from "next";
import { DashboardSideNav } from "@/widgets/dashboard-sidenav";

export const metadata: Metadata = { title: "심사위원 대시보드" };

const NAV_ITEMS = [
  {
    label: "채점",
    href: "/judge/dashboard",
    icon: <IconCheckmarkClipboardLine />,
  },
];

export default function JudgeDashboardLayout({
  children,
}: LayoutProps<"/judge/dashboard">) {
  return (
    <DashboardSideNav navItems={NAV_ITEMS} dark>
      {children}
    </DashboardSideNav>
  );
}
