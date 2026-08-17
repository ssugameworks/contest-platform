import type { Metadata } from "next";
import { CenteredCard } from "@/shared/ui/centered-card";
import { Footer } from "@/shared/ui/footer";

export const metadata: Metadata = { title: "권한이 없어요" };

export default function AdminForbiddenPage() {
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
          {null}
        </CenteredCard>
      </div>
      <Footer />
    </main>
  );
}
