import type { Metadata } from "next";
import { ParticipantLoginForm } from "@/features/login-participant";
import { CenteredCard } from "@/shared/ui/centered-card";

export const metadata: Metadata = { title: "참가자 로그인" };

export default function ParticipantLoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CenteredCard
        title="참가자 로그인"
        description="학번과 비밀번호로 로그인해주세요"
      >
        <ParticipantLoginForm />
      </CenteredCard>
    </main>
  );
}
