"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { staffLogoutAction } from "@/entities/staff/model/actions";

export function ForbiddenLogoutButton() {
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();

  return (
    <ActionButton
      type="button"
      variant="neutralOutline"
      size="large"
      className="w-full"
      loading={loggingOut}
      onClick={() =>
        startLogout(async () => {
          await staffLogoutAction();
          router.push("/admin/login");
          router.refresh();
        })
      }
    >
      로그아웃
    </ActionButton>
  );
}
