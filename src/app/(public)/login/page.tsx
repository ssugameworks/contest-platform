import type { Metadata } from "next";
import { CenteredCard } from "@/shared/ui/centered-card";
import { LoginTabs } from "@/widgets/login-tabs";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CenteredCard title="로그인" description="학번으로 로그인해주세요">
        <LoginTabs />
      </CenteredCard>
    </main>
  );
}
