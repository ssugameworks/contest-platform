import { VStack } from "@seed-design/react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { getCurrentStaff } from "@/entities/staff/model/session";
import { CenteredCard } from "@/shared/ui/centered-card";
import { Footer } from "@/shared/ui/footer";
import { ForbiddenLogoutButton } from "./logout-button";

export const metadata: Metadata = { title: "권한이 없어요" };

export default async function AdminForbiddenPage() {
  // requireAdmin/requireJudge only land here after requireStaff already
  // confirmed a session, so staff is null only if someone opens this URL
  // directly without ever logging in — send those straight to login instead
  // of offering a dashboard link or a logout button for a session that
  // doesn't exist.
  const staff = await getCurrentStaff();
  const dashboardHref =
    staff?.role === "admin" ? "/admin/dashboard" : "/judge/dashboard";

  return (
    <main
      data-seed-color-mode="dark-only"
      className="flex min-h-screen flex-col"
      style={{
        background: "var(--seed-color-bg-layer-default)",
        color: "var(--seed-color-fg-neutral)",
      }}
    >
      <div className="flex flex-1 flex-col">
        <CenteredCard
          title="권한이 없어요"
          description="이 페이지는 관리자만 볼 수 있어요."
        >
          <VStack gap="x2" width="full">
            <ActionButton
              variant="brandSolid"
              size="large"
              className="w-full"
              asChild
            >
              <Link href={staff ? dashboardHref : "/admin/login"}>
                {staff ? "내 대시보드로 가기" : "로그인 페이지로 가기"}
              </Link>
            </ActionButton>
            {staff && <ForbiddenLogoutButton />}
          </VStack>
        </CenteredCard>
      </div>
      <Footer />
    </main>
  );
}
