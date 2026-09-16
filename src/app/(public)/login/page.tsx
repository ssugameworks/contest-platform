import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/entities/session/model/session";
import { CenteredCard } from "@/shared/ui/centered-card";
import { LoginTabs } from "@/widgets/login-tabs";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  // Already logged in (e.g. via a bookmark or the back button) — bounce
  // forward instead of showing the login form again. A participant with no
  // team assigned yet is left alone: /participant/dashboard would just
  // redirect them straight back here (requireParticipantTeamId), which
  // would loop.
  const currentUser = await getCurrentUser();
  if (currentUser?.kind === "investor") {
    redirect("/teams");
  }
  if (currentUser?.kind === "participant" && currentUser.teamId) {
    redirect("/participant/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col">
      <CenteredCard title="로그인" description="학번으로 로그인해주세요">
        <LoginTabs />
      </CenteredCard>
    </main>
  );
}
