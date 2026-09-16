import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/entities/staff/model/session";
import { AdminLoginForm } from "@/features/login-admin";
import { CenteredCard } from "@/shared/ui/centered-card";
import { Footer } from "@/shared/ui/footer";

export const metadata: Metadata = { title: "관리자·심사위원 로그인" };

export default async function AdminLoginPage() {
  // Already logged in (e.g. via a bookmark or the back button) — bounce
  // forward instead of showing the login form again.
  const staff = await getCurrentStaff();
  if (staff) {
    redirect(staff.role === "admin" ? "/admin/dashboard" : "/judge/dashboard");
  }

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
          title="관리자·심사위원 로그인"
          description="아이디와 비밀번호를 입력해주세요"
        >
          <AdminLoginForm />
        </CenteredCard>
      </div>
      <Footer />
    </main>
  );
}
