import type { Metadata } from "next";
import { SubmitApplicationForm } from "@/features/submit-application";
import { CenteredCard } from "@/shared/ui/centered-card";

export const metadata: Metadata = { title: "가입 신청" };

export default function ApplyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CenteredCard
        title="가입 신청"
        description="숭실대학교 재적생이면 누구나 지원할 수 있어요"
      >
        <SubmitApplicationForm />
      </CenteredCard>
    </main>
  );
}
