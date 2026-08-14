import type { Metadata } from "next";
import { StudentLoginForm } from "@/features/login-student";
import { CenteredCard } from "@/shared/ui/centered-card";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CenteredCard
        title="로그인"
        description="학교 이메일로 로그인 링크를 받아요"
      >
        <StudentLoginForm />
      </CenteredCard>
    </main>
  );
}
